package com.shifa.config.security;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ShifaUserRepository extends Repository<Object, UUID> {
    
    interface UserSecurityProjection {
        UUID getId();
        String getEmail();
        String getPhone();
        String getPassword();
        String getRole();
        Boolean getActive();
    }

    @Query(value = "SELECT id, email, phone, password, role, is_active as active FROM users WHERE email = :username OR phone = :username", nativeQuery = true)
    Optional<UserSecurityProjection> findByUsername(@Param("username") String username);
}

