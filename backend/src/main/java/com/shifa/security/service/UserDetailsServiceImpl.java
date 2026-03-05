package com.shifa.security.service;

import com.shifa.security.dto.UserPrincipal;
import com.shifa.domain.user.User;
import com.shifa.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailOrPhoneNumber(username, username)
                .orElseThrow(() -> {
                    log.warn("[UserDetailsService] User not found: {}", username);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        if (user.isDeleted()) {
            throw new UsernameNotFoundException("Account has been deactivated");
        }

        return UserPrincipal.from(user);
    }
}
