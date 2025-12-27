package com.coachai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTOs utilisés pour exposer au frontend une structure de cours
 * de type "Coursera" : modules contenant chacun plusieurs leçons.
 */
public class CourseSyllabusDto {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LessonDto {
        private String id;
        private String moduleId;
        private String courseId;
        private int lessonNumber;
        private String type; // 'video' | 'lecture' | 'quiz' | 'exercise' | 'ai-chat'
        private String title;
        private String description;
        private int duration; // en minutes
        private String videoUrl;
        private String contentUrl;
        private String transcript;
        private boolean isCompleted;
        private boolean isMandatory;
        private int order;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseModuleDto {
        private String id;
        private String courseId;
        private int moduleNumber;
        private String title;
        private String description;
        private double estimatedHours;
        private boolean isLocked;
        private List<LessonDto> lessons;
    }
}


