package com.coachai.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Service
public class AiService {

    private final String AI_ENGINE_URL = "http://localhost:8000/coach/hybrid";
    private final RestTemplate restTemplate;

    public AiService() {
        this.restTemplate = new RestTemplate();
    }

    public String getAiResponse(String question) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> requestBody = Map.of(
                "question", question,
                // Add default values for required fields if needed, but the model has defaults for most
                "difficulty_hint", "unknown" 
            );

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<HybridResponse> response = restTemplate.postForEntity(
                AI_ENGINE_URL, 
                request, 
                HybridResponse.class
            );

            if (response.getBody() != null) {
                return response.getBody().getResponse();
            }
            
            return "Désolé, je n'ai pas pu obtenir de réponse pour le moment.";

        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur de communication avec le moteur IA: " + e.getMessage();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class HybridResponse {
        private String response;
        @JsonProperty("predicted_difficulty")
        private String predictedDifficulty;
        private double confidence;
        private String source;
    }
}
