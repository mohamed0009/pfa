package com.coachai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleProgressResponseDto {
    private String moduleId;
    private String moduleName;
    private int progressPercentage;
    private int completedLessons;
    private int totalLessons;
    private boolean isCompleted;
    private boolean nextModuleUnlocked;
    private String nextLessonId;
    private List<String> completedLessonIds;
}

