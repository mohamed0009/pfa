package com.coachai.controller.user;

import com.coachai.model.CourseCertificate;
import com.coachai.model.Enrollment;
import com.coachai.model.User;
import com.coachai.repository.EnrollmentRepository;
import com.coachai.repository.UserRepository;
import com.coachai.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/certificates")
@CrossOrigin(origins = "http://localhost:4200")
public class UserCertificateController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    /**
     * Récupère tous les certificats de l'utilisateur
     */
    @GetMapping
    public ResponseEntity<?> getMyCertificates(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<CourseCertificate> certificates = certificateService.getUserCertificates(user);
            return ResponseEntity.ok(certificates);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching certificates",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Génère un certificat pour un enrollment
     */
    @PostMapping("/generate/{enrollmentId}")
    public ResponseEntity<?> generateCertificate(@PathVariable String enrollmentId,
                                                  Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

            CourseCertificate certificate = certificateService.generateCourseCertificate(enrollment);
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of(
                "error", "Cannot generate certificate",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Vérifie un certificat par code de vérification
     */
    @GetMapping("/verify/{verificationCode}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String verificationCode) {
        try {
            CourseCertificate certificate = certificateService.verifyCertificate(verificationCode);
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "Certificate not found",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Télécharge le PDF du certificat
     * TODO: Implémenter la génération du PDF
     */
    @GetMapping("/{certificateId}/download")
    public ResponseEntity<?> downloadCertificate(@PathVariable String certificateId) {
        try {
            // TODO: Générer et retourner le PDF
            return ResponseEntity.ok(Map.of(
                "message", "Certificate download - PDF generation to be implemented",
                "certificateId", certificateId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error downloading certificate",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}
