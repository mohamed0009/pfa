package com.coachai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressDetailDto {
    private String enrollmentId;
    private String courseId;
    private String courseTitle;
    private int overallProgress;
    private int completedModules;
    private int totalModules;
    private int completedLessons;
    private int totalLessons;
    private double averageScore;
    private String nextModuleId;
    private String nextLessonId;
    private List<ModuleProgressResponseDto> moduleProgress;
}

