package com.microhustle.controller;

import com.microhustle.model.HustlerRating;
import com.microhustle.model.Task;
import com.microhustle.model.User;
import com.microhustle.repository.HustlerRatingRepository;
import com.microhustle.repository.TaskRepository;
import com.microhustle.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
public class HustlerRatingController {
    @Autowired
    private HustlerRatingRepository ratingRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private TaskRepository taskRepo;

    // Poster gives rating to hustler for a task
    @PostMapping("/give")
    public ResponseEntity<?> giveRating(
            @RequestParam Long hustlerId,
            @RequestParam Long posterId,
            @RequestParam Long taskId,
            @RequestParam int rating,
            @RequestParam(required = false) String comment
    ) {
        Optional<User> hustlerOpt = userRepo.findById(hustlerId);
        Optional<User> posterOpt = userRepo.findById(posterId);
        Optional<Task> taskOpt = taskRepo.findById(taskId);
        if (!hustlerOpt.isPresent() || !posterOpt.isPresent() || !taskOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Invalid hustler, poster, or task");
        }
        // Prevent duplicate rating for same task/hustler/poster
        if (ratingRepo.existsByTaskAndPosterAndHustler(taskOpt.get(), posterOpt.get(), hustlerOpt.get())) {
            return ResponseEntity.badRequest().body("Already rated");
        }
        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body("Rating must be 1-5");
        }
        HustlerRating r = new HustlerRating();
        r.setHustler(hustlerOpt.get());
        r.setPoster(posterOpt.get());
        r.setTask(taskOpt.get());
        r.setRating(rating);
        r.setComment(comment);
        ratingRepo.save(r);
        return ResponseEntity.ok(r);
    }

    // Get all ratings for a hustler
    @GetMapping("/hustler/{hustlerId}")
    public List<HustlerRating> getRatingsForHustler(@PathVariable Long hustlerId) {
        return ratingRepo.findByHustlerId(hustlerId);
    }

    // Get average rating for a hustler
    @GetMapping("/hustler/{hustlerId}/average")
    public Double getAverageRating(@PathVariable Long hustlerId) {
        Double avg = ratingRepo.findAverageRatingByHustlerId(hustlerId);
        return avg != null ? avg : 0.0;
    }

    // Get all ratings given by a poster
    @GetMapping("/poster/{posterId}")
    public List<HustlerRating> getRatingsByPoster(@PathVariable Long posterId) {
        return ratingRepo.findByPosterId(posterId);
    }
}
