package com.microhustle.repository;

import com.microhustle.model.Message;
import com.microhustle.model.Task;
import com.microhustle.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByTaskAndSenderAndRecipientOrderBySentAtAsc(Task task, User sender, User recipient);
    List<Message> findByTaskAndSenderIdAndRecipientIdOrderBySentAtAsc(Task task, Long senderId, Long recipientId);
    List<Message> findByTaskIdAndSenderIdInAndRecipientIdInOrderBySentAtAsc(Long taskId, List<Long> userIdsA, List<Long> userIdsB);

    List<Message> findByTaskIdOrderBySentAtAsc(Long taskId);
    List<Message> findBySenderIdOrRecipientIdOrderBySentAtDesc(Long senderId, Long recipientId);
    List<Message> findByRecipientIdOrderBySentAtDesc(Long recipientId);
}
