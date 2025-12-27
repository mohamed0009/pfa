package com.coachai.controller.user;

import com.coachai.dto.CourseSyllabusDto;
import com.coachai.model.Course;
import com.coachai.model.ContentStatus;
import com.coachai.model.Lesson;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:4200")
public class CourseController {
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Boolean popular) {
        try {
            List<Course> courses = List.of();
            
            if (popular != null && popular) {
                try {
                    courses = courseRepository.findPopularCourses(ContentStatus.PUBLISHED);
                } catch (Exception e) {
                    // Fallback to all published courses
                    courses = courseRepository.findByStatus(ContentStatus.PUBLISHED);
                }
            } else if (category != null && !category.isEmpty()) {
                try {
                    // Use method that filters by both category and status
                    courses = courseRepository.findByCategoryAndStatus(category, ContentStatus.PUBLISHED);
                } catch (Exception e) {
                    // Return empty list if category filter fails
                    courses = List.of();
                }
            } else if (level != null && !level.isEmpty()) {
                try {
                    Course.Level levelEnum = Course.Level.valueOf(level.toUpperCase());
                    // Use method that filters by both level and status
                    courses = courseRepository.findByLevelAndStatus(levelEnum, ContentStatus.PUBLISHED);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid level parameter", "validLevels", new String[]{"DEBUTANT", "INTERMEDIAIRE", "AVANCE"}));
                } catch (Exception e) {
                    courses = List.of();
                }
            } else {
                // Get all PUBLISHED courses - this includes courses created by trainers
                courses = courseRepository.findByStatus(ContentStatus.PUBLISHED);
                System.out.println("Found " + courses.size() + " PUBLISHED courses");
                
                // Also try to get courses from PUBLISHED formations (if any)
                try {
                    List<Course> formationCourses = courseRepository.findAvailableCourses(ContentStatus.PUBLISHED);
                    System.out.println("Found " + formationCourses.size() + " courses from formations");
                    // Add courses from formations that are not already in the list
                    for (Course fc : formationCourses) {
                        if (fc.getStatus() != ContentStatus.PUBLISHED && 
                            fc.getModule() != null && 
                            fc.getModule().getFormation() != null &&
                            fc.getModule().getFormation().getStatus() == ContentStatus.PUBLISHED) {
                            // Only add if not already in list
                            if (!courses.stream().anyMatch(c -> c.getId().equals(fc.getId()))) {
                                courses.add(fc);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching formation courses: " + e.getMessage());
                    // If findAvailableCourses fails, just use findByStatus result
                }
            }
            
            // Final filter: ensure we only return PUBLISHED courses or courses from PUBLISHED formations
            courses = courses.stream()
                .filter(course -> {
                    // Include if course is PUBLISHED (this is the main case for trainer-created courses)
                    if (course.getStatus() == ContentStatus.PUBLISHED) {
                        return true;
                    }
                    // Include if course belongs to a PUBLISHED formation
                    if (course.getModule() != null && 
                        course.getModule().getFormation() != null &&
                        course.getModule().getFormation().getStatus() == ContentStatus.PUBLISHED) {
                        return true;
                    }
                    return false;
                })
                .distinct() // Remove duplicates
                .collect(Collectors.toList());
            
            if (courses == null) {
                courses = List.of();
            }
            
            System.out.println("Returning " + courses.size() + " courses to frontend");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching courses", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found", "id", id));
            }
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Expose une structure de syllabus de type Coursera :
     * un cours contient plusieurs modules, chaque module contient plusieurs leçons.
     * Pour l'instant, les modules sont dérivés des leçons existantes en groupes
     * (par exemple 4 leçons par module) afin d'éviter de modifier le schéma.
     */
    @GetMapping("/{id}/syllabus")
    public ResponseEntity<?> getCourseSyllabus(@PathVariable String id) {
        try {
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }

            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found", "id", id));
            }

            List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
            if (lessons == null || lessons.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            // Regrouper les leçons en modules logiques (4 leçons par module)
            Map<Integer, List<Lesson>> lessonsByModule = new java.util.LinkedHashMap<>();
            for (Lesson lesson : lessons) {
                int moduleNumber = Math.max(1, ((lesson.getLessonNumber() - 1) / 4) + 1);
                lessonsByModule
                    .computeIfAbsent(moduleNumber, k -> new java.util.ArrayList<>())
                    .add(lesson);
            }

            List<CourseSyllabusDto.CourseModuleDto> modules = new java.util.ArrayList<>();
            for (Map.Entry<Integer, List<Lesson>> entry : lessonsByModule.entrySet()) {
                int moduleNumber = entry.getKey();
                String moduleId = course.getId() + "-module-" + moduleNumber;

                List<CourseSyllabusDto.LessonDto> lessonDtos = entry.getValue().stream()
                    .map(l -> {
                        String typeStr;
                        if (l.getType() != null) {
                            switch (l.getType()) {
                                case VIDEO -> typeStr = "video";
                                case LECTURE -> typeStr = "lecture";
                                case QUIZ -> typeStr = "quiz";
                                case EXERCISE -> typeStr = "exercise";
                                case AI_CHAT -> typeStr = "ai-chat";
                                default -> typeStr = "lecture";
                            }
                        } else {
                            typeStr = "lecture";
                        }

                        return new CourseSyllabusDto.LessonDto(
                                l.getId(),
                                moduleId,
                                course.getId(),
                                l.getLessonNumber(),
                                typeStr,
                                l.getTitle(),
                                l.getDescription(),
                                l.getDuration(),
                                l.getVideoUrl(),
                                l.getContentUrl(),
                                l.getTranscript(),
                                false, // isCompleted géré côté frontend
                                l.isMandatory(),
                                l.getOrder()
                        );
                    })
                    .collect(Collectors.toList());

                // Estimation de la durée du module à partir des leçons
                int totalMinutes = lessonDtos.stream()
                        .mapToInt(CourseSyllabusDto.LessonDto::getDuration)
                        .sum();

                CourseSyllabusDto.CourseModuleDto moduleDto =
                        new CourseSyllabusDto.CourseModuleDto(
                                moduleId,
                                course.getId(),
                                moduleNumber,
                                "Module " + moduleNumber,
                                null,
                                totalMinutes / 60.0,
                                false,
                                lessonDtos
                        );

                modules.add(moduleDto);
            }

            return ResponseEntity.ok(modules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching course syllabus", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


