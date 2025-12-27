package com.coachai.controller.user;

import com.coachai.dto.CourseProgressDetailDto;
import com.coachai.dto.LessonProgressDto;
import com.coachai.dto.ModuleProgressResponseDto;
import com.coachai.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/progress")
@CrossOrigin(origins = "http://localhost:4200")
public class UserProgressController {

    @Autowired
    private ProgressService progressService;

    /**
     * Marquer une leçon comme terminée
     */
    @PostMapping("/lesson/complete")
    public ResponseEntity<?> completeLess(@RequestBody LessonProgressDto progressDto,
                                              Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ModuleProgressResponseDto response = progressService.markLessonCompleted(progressDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error completing lesson",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Obtenir la progression détaillée d'un cours
     */
    @GetMapping("/course/{enrollmentId}")
    public ResponseEntity<?> getCourseProgress(@PathVariable String enrollmentId,
                                                Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            CourseProgressDetailDto progress = progressService.getCourseProgress(enrollmentId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching course progress",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}
