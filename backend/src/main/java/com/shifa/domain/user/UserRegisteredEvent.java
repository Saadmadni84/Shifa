package com.shifa.domain.user;

import com.shifa.domain.user.dto.RegisterRequest;
import org.springframework.context.ApplicationEvent;

public class UserRegisteredEvent extends ApplicationEvent {
    private final User user;
    private final RegisterRequest request;

    public UserRegisteredEvent(Object source, User user, RegisterRequest request) {
        super(source);
        this.user = user;
        this.request = request;
    }

    public User getUser() {
        return user;
    }

    public RegisterRequest getRequest() {
        return request;
    }
}
