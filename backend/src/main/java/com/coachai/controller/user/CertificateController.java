package com.coachai.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin("*")
public class CertificateController {

    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateCertificate(
            @RequestParam String studentName,
            @RequestParam String courseName) {
        
        // Cette méthode n'est plus utilisée - le certificat est généré via UserCertificateController
        // Retourner une réponse vide ou rediriger
        return ResponseEntity.noContent().build();
    }
}
