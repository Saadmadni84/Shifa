package com.shifa.config.security;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Security UserDetailsService implementation.
 *
 * "Username" in Shifa means:
 *  • Doctors / Admins / Receptionists → email address
 *  • Patients                         → phone number (OTP-based login)
 *
 * Loads only the columns needed for authentication from the users table —
 * avoids pulling the full Doctor or Patient entity graph on every API request.
 *
 * Account state mapping:
 *  is_active = false  → disabled = true   → Spring throws DisabledException
 *  deleted   = true   → throws UsernameNotFoundException (acts as if user doesn't exist)
 *
 * Role format: DB stores "DOCTOR", Spring Security expects "ROLE_DOCTOR".
 * We add the "ROLE_" prefix here so callers never need to think about it.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class UserDetailsServiceImpl implements UserDetailsService {

    @PersistenceContext
    private EntityManager em;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // username = email OR phone_number — handles both doctor and patient login
        UserAuthRecord record = findUserRecord(username);

        if (record == null) {
            log.warn("User not found: ****{}", maskEnd(username));
            throw new UsernameNotFoundException("User not found: " + username);
        }

        if (record.deleted()) {
            log.warn("Auth attempt on deleted user: ****{}", maskEnd(username));
            throw new UsernameNotFoundException("Account does not exist");
        }

        return User.builder()
            .username(username)
            .password(record.passwordHash())    // BCrypt hash from DB
            .authorities(List.of(
                new SimpleGrantedAuthority("ROLE_" + record.role())
            ))
            .accountExpired(false)
            .accountLocked(!record.active())    // is_active=false → locked
            .credentialsExpired(false)
            .disabled(!record.active())
            .build();
    }

    /**
     * Single lightweight native query — fetches only auth-relevant columns.
     * Avoids loading clinic_name, registration_number, etc. on every API call.
     *
     * Matches on email OR phone_number so one method handles all user types.
     */
    private UserAuthRecord findUserRecord(String identifier) {
        try {
            Object[] row = (Object[]) em.createNativeQuery("""
                    SELECT u.password_hash,
                           u.role,
                           u.is_active,
                           u.deleted
                    FROM   users u
                    WHERE  (u.email = :id OR u.phone_number = :id)
                      AND  u.deleted = false
                    LIMIT  1
                    """)
                .setParameter("id", identifier)
                .getSingleResult();

            return new UserAuthRecord(
                (String)  row[0],           // passwordHash
                (String)  row[1],           // role
                (Boolean) row[2],           // active (is_active)
                (Boolean) row[3]            // deleted
            );
        } catch (NoResultException e) {
            return null;
        }
    }

    private String maskEnd(String s) {
        if (s == null || s.length() <= 4) return "****";
        return "****" + s.substring(s.length() - 4);
    }

    /**
     * Minimal projection — only the fields needed to build UserDetails.
     * Using a Java record (immutable, value-based, no boilerplate).
     */
    private record UserAuthRecord(
        String  passwordHash,
        String  role,
        boolean active,
        boolean deleted
    ) {}
}
