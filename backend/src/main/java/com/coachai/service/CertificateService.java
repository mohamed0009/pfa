package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service de génération de certificats
 * Règle: Un certificat est généré si 100% des modules validés
 */
@Service
public class CertificateService {
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationProgressRepository progressRepository;
    
    @Autowired
    private CertificateRepository certificateRepository;
    
    @Autowired
    private CourseCertificateRepository courseCertificateRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepositoryOld;
    
    
    /**
     * Génère un certificat pour une formation complétée
     * Le certificat contient:
     * - Nom apprenant
     * - Nom formation
     * - Date
     * - Identifiant unique
     */
    @Transactional
    public Certificate generateCertificate(String enrollmentId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        // Vérifier que tous les modules sont validés
        FormationProgress progress = progressRepository.findByEnrollment(enrollment)
            .orElseThrow(() -> new IllegalArgumentException("Progress not found"));
        
        if (!progress.isAllModulesValidated()) {
            throw new IllegalStateException("Tous les modules doivent être validés pour obtenir le certificat");
        }
        
        // Créer le certificat
        Certificate certificate = new Certificate();
        certificate.setId(UUID.randomUUID().toString());
        certificate.setEnrollment(enrollment);
        certificate.setFormation(enrollment.getFormation());
        certificate.setUser(enrollment.getUser());
        certificate.setIssuedAt(LocalDateTime.now());
        certificate.setCertificateNumber(generateCertificateNumber(enrollment));
        certificate.setCertificateUrl(generateCertificateUrl(certificate.getCertificateNumber()));
        
        // Mettre à jour l'inscription
        enrollment.setCertificateEarned(true);
        enrollment.setCertificateUrl(certificate.getCertificateUrl());
        enrollment.setCompletedAt(LocalDateTime.now());
        enrollment.setStatus(FormationEnrollment.EnrollmentStatus.COMPLETED);
        
        enrollmentRepository.save(enrollment);
        
        return certificate;
    }
    
    /**
     * Génère un numéro de certificat unique
     */
    private String generateCertificateNumber(FormationEnrollment enrollment) {
        String formationCode = enrollment.getFormation().getId().substring(0, 8).toUpperCase();
        String userCode = enrollment.getUser().getId().substring(0, 8).toUpperCase();
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(7);
        return String.format("CERT-%s-%s-%s", formationCode, userCode, timestamp);
    }
    
    /**
     * Génère l'URL du certificat
     */
    private String generateCertificateUrl(String certificateNumber) {
        return "/certificates/" + certificateNumber + ".pdf";
    }
    
    // ==================== MÉTHODES POUR COURSE CERTIFICATES (ancien système) ====================
    
    /**
     * Récupère tous les certificats de cours d'un utilisateur
     */
    public List<CourseCertificate> getUserCertificates(User user) {
        return courseCertificateRepository.findByUser(user);
    }
    
    /**
     * Récupère tous les certificats de formation d'un utilisateur
     */
    public List<Certificate> getUserFormationCertificates(User user) {
        return certificateRepository.findByUser(user);
    }
    
    /**
     * Génère un certificat pour un enrollment de cours (ancien système)
     */
    @Transactional
    public CourseCertificate generateCourseCertificate(Enrollment enrollment) {
        // Vérifier si un certificat existe déjà
        Optional<CourseCertificate> existing = courseCertificateRepository.findByEnrollment(enrollment);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Créer le certificat
        CourseCertificate certificate = new CourseCertificate();
        certificate.setId(UUID.randomUUID().toString());
        certificate.setEnrollment(enrollment);
        certificate.setCourse(enrollment.getCourse());
        certificate.setUser(enrollment.getUser());
        certificate.setIssuedAt(LocalDateTime.now());
        certificate.setVerificationCode(generateVerificationCode());
        certificate.setCertificateUrl("/certificates/course/" + certificate.getId() + ".pdf");
        
        // Calculer le score moyen si disponible
        if (enrollment.getProgress() != null) {
            certificate.setScore(enrollment.getProgress().getAverageQuizScore());
        }
        
        CourseCertificate saved = courseCertificateRepository.save(certificate);
        
        // Mettre à jour l'enrollment
        enrollment.setCertificateEarned(true);
        enrollment.setCertificateUrl(saved.getCertificateUrl());
        enrollmentRepositoryOld.save(enrollment);
        
        return saved;
    }
    
    /**
     * Vérifie un certificat par code de vérification
     */
    public CourseCertificate verifyCertificate(String verificationCode) {
        return courseCertificateRepository.findByVerificationCode(verificationCode)
            .orElseThrow(() -> new IllegalArgumentException("Certificat non trouvé"));
    }
    
    /**
     * Génère un code de vérification unique
     */
    private String generateVerificationCode() {
        return "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
