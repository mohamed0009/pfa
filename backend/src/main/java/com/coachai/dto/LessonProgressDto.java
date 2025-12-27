package com.coachai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressDto {
    private String lessonId;
    private String enrollmentId;
    private boolean completed;
    private Integer timeSpent; // en secondes
    private Double score; // pour les quiz
}

