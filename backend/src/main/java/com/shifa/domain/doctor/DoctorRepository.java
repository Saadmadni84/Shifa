package com.shifa.domain.doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.shifa.domain.user.User;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("SELECT d FROM Doctor d WHERE d.digestEnabled = true")
    List<Doctor> findAllWithDigestEnabled();

    Optional<Doctor> findByUser(User user);

    Optional<Doctor> findByUserId(UUID userId);
}
