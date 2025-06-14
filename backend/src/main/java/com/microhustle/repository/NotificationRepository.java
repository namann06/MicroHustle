package com.microhustle.repository;

import com.microhustle.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByPosterIdOrderByCreatedAtDesc(Long posterId);
    List<Notification> findByPosterIdAndReadFalseOrderByCreatedAtDesc(Long posterId);
}
