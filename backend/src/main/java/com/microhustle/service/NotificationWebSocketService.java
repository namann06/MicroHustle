package com.microhustle.service;

import com.microhustle.controller.NotificationController.NotificationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationWebSocketService {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToPoster(Long posterId, NotificationDTO notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + posterId, notification);
    }
}
