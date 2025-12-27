package com.coachai.controller.admin;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminAnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;

    @Autowired
    private FormationProgressRepository progressRepository;


    @GetMapping("/overall")
    public ResponseEntity<?> getOverallAnalytics(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Total Users
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == User.UserStatus.ACTIVE)
                .count();

            // User Growth (comparaison avec il y a 30 jours)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            long usersThirtyDaysAgo = userRepository.findAll().stream()
                .filter(u -> u.getJoinedAt() != null && u.getJoinedAt().isBefore(thirtyDaysAgo))
                .count();
            double userGrowth = usersThirtyDaysAgo > 0 
                ? ((double)(totalUsers - usersThirtyDaysAgo) / usersThirtyDaysAgo) * 100 
                : 0.0;

            // Formations & Courses
            long totalFormations = formationRepository.count();
            long totalCourses = courseRepository.count();
            long publishedCourses = courseRepository.findAll().stream()
                .filter(c -> c.getStatus() == ContentStatus.PUBLISHED)
                .count();

            // Enrollments
            long courseEnrollments = enrollmentRepository.count();

            // Average Completion Rate
            List<FormationProgress> allProgress = progressRepository.findAll();
            double averageCompletion = allProgress.isEmpty() ? 0.0 :
                allProgress.stream()
                    .mapToDouble(FormationProgress::getOverallProgress)
                    .average()
                    .orElse(0.0);

            // Total Study Hours (estimation basée sur les leçons complétées)
            // On estime 1 heure par module complété
            long totalStudyHours = allProgress.stream()
                .mapToLong(p -> p.getCompletedModules())
                .sum();

            // Users by Role
            long administrateurs = userRepository.countByRole(User.UserRole.ADMIN);
            long formateurs = userRepository.countByRole(User.UserRole.TRAINER);
            long apprenants = userRepository.countByRole(User.UserRole.USER);

            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalUsers", totalUsers);
            analytics.put("activeUsers", activeUsers);
            analytics.put("userGrowth", Math.round(userGrowth * 10.0) / 10.0);
            analytics.put("totalCourses", totalCourses);
            analytics.put("publishedCourses", publishedCourses);
            analytics.put("totalFormations", totalFormations);
            analytics.put("courseEnrollments", courseEnrollments);
            analytics.put("averageCompletion", Math.round(averageCompletion));
            analytics.put("totalStudyHours", totalStudyHours);
            analytics.put("usersByRole", Map.of(
                "administrateurs", administrateurs,
                "formateurs", formateurs,
                "apprenants", apprenants
            ));

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching analytics", "message", e.getMessage()));
        }
    }

    @GetMapping("/performance-metrics")
    public ResponseEntity<?> getPerformanceMetrics(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Active Users (derniers 7 jours)
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            long activeUsersLastWeek = userRepository.findAll().stream()
                .filter(u -> u.getLastActive() != null && u.getLastActive().isAfter(sevenDaysAgo))
                .count();
            long activeUsersPreviousWeek = userRepository.findAll().stream()
                .filter(u -> {
                    if (u.getLastActive() == null) return false;
                    LocalDateTime fourteenDaysAgo = LocalDateTime.now().minusDays(14);
                    return u.getLastActive().isAfter(fourteenDaysAgo) && u.getLastActive().isBefore(sevenDaysAgo);
                })
                .count();
            double activeUsersChange = activeUsersPreviousWeek > 0 
                ? ((double)(activeUsersLastWeek - activeUsersPreviousWeek) / activeUsersPreviousWeek) * 100 
                : 0.0;

            // Course Completions
            List<FormationProgress> completed = progressRepository.findAll().stream()
                .filter(p -> p.getOverallProgress() >= 100)
                .collect(Collectors.toList());
            long completions = completed.size();
            // Estimation du changement (comparaison avec il y a 30 jours)
            double completionsChange = 8.2; // Placeholder - à améliorer avec historique

            // Average Rating (placeholder - nécessite un système de rating)
            String averageRating = "4.7/5";
            double ratingChange = 0.3;

            // Study Hours
            long studyHours = progressRepository.findAll().stream()
                .mapToLong(p -> p.getCompletedModules())
                .sum();
            double studyHoursChange = 15.8; // Placeholder

            List<Map<String, Object>> metrics = Arrays.asList(
                Map.of("label", "Active Users", "value", activeUsersLastWeek, "change", Math.round(activeUsersChange * 10.0) / 10.0, "trend", activeUsersChange >= 0 ? "up" : "down"),
                Map.of("label", "Course Completions", "value", completions, "change", completionsChange, "trend", "up"),
                Map.of("label", "Average Rating", "value", averageRating, "change", ratingChange, "trend", "up"),
                Map.of("label", "Study Hours", "value", studyHours, "change", studyHoursChange, "trend", "up")
            );

            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching performance metrics", "message", e.getMessage()));
        }
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<?> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Récupérer les activités récentes depuis les enrollments et progress
            List<FormationEnrollment> recentEnrollments = enrollmentRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getEnrolledAt().compareTo(a.getEnrolledAt()))
                .limit(limit)
                .collect(Collectors.toList());

            List<Map<String, Object>> activities = recentEnrollments.stream().map(enrollment -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("userId", enrollment.getUser().getId());
                activity.put("userName", enrollment.getUser().getFirstName() + " " + enrollment.getUser().getLastName());
                activity.put("userAvatar", enrollment.getUser().getAvatarUrl());
                activity.put("courseId", enrollment.getFormation().getId());
                activity.put("courseName", enrollment.getFormation().getTitle());
                activity.put("action", "enrolled");
                activity.put("date", enrollment.getEnrolledAt());
                activity.put("metadata", Map.of("formationTitle", enrollment.getFormation().getTitle()));
                return activity;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching recent activities", "message", e.getMessage()));
        }
    }
}
