package com.microhustle.repository;

import com.microhustle.model.HustlerRating;
import com.microhustle.model.User;
import com.microhustle.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface HustlerRatingRepository extends JpaRepository<HustlerRating, Long> {
    List<HustlerRating> findByHustler(User hustler);
    List<HustlerRating> findByHustlerId(Long hustlerId);
    List<HustlerRating> findByTask(Task task);
    @Query("SELECT AVG(r.rating) FROM HustlerRating r WHERE r.hustler.id = :hustlerId")
    Double findAverageRatingByHustlerId(Long hustlerId);
    boolean existsByTaskAndPosterAndHustler(Task task, User poster, User hustler);
}
