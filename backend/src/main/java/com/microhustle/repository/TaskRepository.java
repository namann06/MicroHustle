package com.microhustle.repository;

import com.microhustle.model.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Find tasks posted by a specific user (poster)
    List<Task> findByPosterId(Long posterId);

    // Find tasks accepted by a specific hustler
    List<Task> findByAcceptedHustlers_Id(Long hustlerId);
}
