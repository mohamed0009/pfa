package com.coachai.repository;

import com.coachai.model.Certificate;
import com.coachai.model.FormationEnrollment;
import com.coachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    Optional<Certificate> findByEnrollment(FormationEnrollment enrollment);
    List<Certificate> findByUser(User user);
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
}
