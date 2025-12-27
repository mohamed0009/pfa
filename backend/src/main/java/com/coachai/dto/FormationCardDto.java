package com.coachai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormationCardDto {
    private String id;
    private String title;
    private String description;
    private String thumbnail;
    private String category;
    private String level;
    private double duration; // heures
    private int enrolledCount;
    private double completionRate;
    private int modulesCount;
    private int coursesCount;
    private int quizzesCount;
    
    // Informations formateur
    private TrainerInfoDto trainer;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainerInfoDto {
        private String id;
        private String firstName;
        private String lastName;
        private String avatarUrl;
        private String bio;
    }
}

