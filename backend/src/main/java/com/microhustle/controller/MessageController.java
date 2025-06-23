package com.microhustle.controller;

import com.microhustle.model.Message;
import com.microhustle.model.Task;
import com.microhustle.model.User;
import com.microhustle.repository.MessageRepository;
import com.microhustle.repository.TaskRepository;
import com.microhustle.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    // Send a message (with optional attachment URL)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestParam Long senderId,
            @RequestParam Long recipientId,
            @RequestParam Long taskId,
            @RequestParam String content,
            @RequestParam(required = false) String attachmentUrl
    ) {
        Optional<User> senderOpt = userRepository.findById(senderId);
        Optional<User> recipientOpt = userRepository.findById(recipientId);
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (!senderOpt.isPresent() || !recipientOpt.isPresent() || !taskOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Invalid sender, recipient, or task");
        }
        Message msg = new Message();
        msg.setSender(senderOpt.get());
        msg.setRecipient(recipientOpt.get());
        msg.setTask(taskOpt.get());
        msg.setContent(content);
        msg.setAttachmentUrl(attachmentUrl);
        msg.setRead(false);
        messageRepository.save(msg);
        // Broadcast to WebSocket topic for this chat thread
        String topic = String.format("/topic/chat/%d-%d-%d", taskId, Math.min(senderId, recipientId), Math.max(senderId, recipientId));
        messagingTemplate.convertAndSend(topic, msg);
        return ResponseEntity.ok(msg);
    }

    // Fetch all messages for a task between two users (both directions)
    @GetMapping("/thread")
    public List<Message> getThread(
            @RequestParam Long taskId,
            @RequestParam Long userA,
            @RequestParam Long userB
    ) {
        List<Long> userIds = java.util.Arrays.asList(userA, userB);
        return messageRepository.findByTaskIdAndSenderIdInAndRecipientIdInOrderBySentAtAsc(taskId, userIds, userIds);
    }

    // Inbox for hustler: get all poster-task threads with unread count
    @GetMapping("/inbox")
    public List<InboxThreadDTO> getInbox(@RequestParam Long userId) {
        // Find all messages where the user is either sender or recipient
        List<Message> messages = messageRepository.findBySenderIdOrRecipientIdOrderBySentAtDesc(userId, userId);
        Map<String, InboxThreadDTO> threads = new LinkedHashMap<>();
        for (Message msg : messages) {
            if (msg.getTask() == null || msg.getTask().getPoster() == null) continue;
            // Only show threads where user is the hustler (not poster)
            Task task = msg.getTask();
            User poster = task.getPoster();
            Long posterId = poster.getId();
            // Find the other participant (poster)
            if (userId.equals(posterId)) continue; // skip if hustler is poster
            String key = task.getId() + ":" + posterId;
            InboxThreadDTO thread = threads.get(key);
            if (thread == null) {
                thread = new InboxThreadDTO();
                thread.taskId = task.getId();
                thread.taskTitle = task.getTitle();
                thread.posterId = posterId;
                thread.posterUsername = poster.getUsername();
                thread.unreadCount = 0;
                threads.put(key, thread);
            }
            // Count unread messages for this hustler
            if (!msg.isRead() && msg.getRecipient() != null && msg.getRecipient().getId().equals(userId)) {
                thread.unreadCount++;
            }
        }
        return new ArrayList<>(threads.values());
    }

    // Inbox for poster: get all hustler-task threads with unread count
    @GetMapping("/poster-inbox")
    public List<PosterInboxThreadDTO> getPosterInbox(@RequestParam Long userId) {
        List<Message> messages = messageRepository.findBySenderIdOrRecipientIdOrderBySentAtDesc(userId, userId);
        Map<String, PosterInboxThreadDTO> threads = new LinkedHashMap<>();
        for (Message msg : messages) {
            if (msg.getTask() == null) continue;
            Task task = msg.getTask();
            // DO NOT SKIP archived tasks -- allow all tasks
            if (task.getPoster() == null || !task.getPoster().getId().equals(userId)) continue;
            // Always get the hustler as the non-poster participant
            User sender = msg.getSender();
            User recipient = msg.getRecipient();
            User hustler = null;
            if (sender != null && !sender.getId().equals(userId) && sender.getRole() == User.Role.HUSTLER) {
                hustler = sender;
            } else if (recipient != null && !recipient.getId().equals(userId) && recipient.getRole() == User.Role.HUSTLER) {
                hustler = recipient;
            }
            if (hustler == null) continue;
            String key = task.getId() + ":" + hustler.getId();
            PosterInboxThreadDTO thread = threads.get(key);
            if (thread == null) {
                thread = new PosterInboxThreadDTO();
                thread.taskId = task.getId();
                thread.taskTitle = task.getTitle();
                thread.hustlerId = hustler.getId();
                thread.hustlerUsername = hustler.getUsername();
                thread.unreadCount = 0;
                threads.put(key, thread);
            }
            // Count unread messages for this poster
            if (!msg.isRead() && msg.getRecipient() != null && msg.getRecipient().getId().equals(userId)) {
                thread.unreadCount++;
            }
        }
        return new ArrayList<>(threads.values());
    }

    static class PosterInboxThreadDTO {
        public Long taskId;
        public String taskTitle;
        public Long hustlerId;
        public String hustlerUsername;
        public int unreadCount;
    }

    // Mark all messages in a thread as read for the poster
    @PostMapping("/mark-thread-read")
    public ResponseEntity<?> markThreadRead(
        @RequestParam Long taskId,
        @RequestParam Long posterId,
        @RequestParam Long hustlerId
    ) {
        List<Message> messages = messageRepository.findByTaskIdAndSenderIdInAndRecipientIdInOrderBySentAtAsc(
            taskId,
            java.util.Arrays.asList(posterId, hustlerId),
            java.util.Arrays.asList(posterId, hustlerId)
        );
        int count = 0;
        for (Message msg : messages) {
            if (!msg.isRead() && msg.getRecipient() != null && msg.getRecipient().getId().equals(posterId)) {
                msg.setRead(true);
                messageRepository.save(msg);
                count++;
            }
        }
        return ResponseEntity.ok(java.util.Collections.singletonMap("updated", count));
    }

    // Mark all messages in a thread as read for the hustler
    @PostMapping("/mark-thread-read-hustler")
    public ResponseEntity<?> markThreadReadHustler(
        @RequestParam Long taskId,
        @RequestParam Long posterId,
        @RequestParam Long hustlerId
    ) {
        List<Message> messages = messageRepository.findByTaskIdAndSenderIdInAndRecipientIdInOrderBySentAtAsc(
            taskId,
            java.util.Arrays.asList(posterId, hustlerId),
            java.util.Arrays.asList(posterId, hustlerId)
        );
        int count = 0;
        for (Message msg : messages) {
            if (!msg.isRead() && msg.getRecipient() != null && msg.getRecipient().getId().equals(hustlerId)) {
                msg.setRead(true);
                messageRepository.save(msg);
                count++;
            }
        }
        return ResponseEntity.ok(java.util.Collections.singletonMap("updated", count));
    }

    public static class InboxThreadDTO {
        public Long taskId;
        public String taskTitle;
        public Long posterId;
        public String posterUsername;
        public int unreadCount;
    }

    // Fetch all messages for a task
    @GetMapping("/task/{taskId}")
    public List<Message> getMessagesForTask(@PathVariable Long taskId) {
        return messageRepository.findByTaskIdOrderBySentAtAsc(taskId);
    }

    // Mark a message as read
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Optional<Message> msgOpt = messageRepository.findById(id);
        if (!msgOpt.isPresent()) return ResponseEntity.notFound().build();
        Message msg = msgOpt.get();
        msg.setRead(true);
        messageRepository.save(msg);
        return ResponseEntity.ok(msg);
    }
}
