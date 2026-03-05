package com.shifa.security.dto;

import com.shifa.domain.user.User;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class UserPrincipal implements UserDetails {

    private final UUID userId;
    private final String username;
    private final String password;
    private final String role;
    private final String displayName;
    private final boolean enabled;
    private final boolean deleted;

    public static UserPrincipal from(User user) {
        return UserPrincipal.builder()
                .userId(user.getId())
                .username(user.getEmail() != null ? user.getEmail() : user.getPhoneNumber())
                .password(user.getPasswordHash())
                .role(user.getRole())
                .displayName(user.getDisplayName())
                .enabled(!user.isDeleted())
                .deleted(user.isDeleted())
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !deleted;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
