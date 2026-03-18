package com.shifa.controller;

import com.shifa.domain.user.User;
import com.shifa.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UsersApiController {

    private final UserRepository repo;

    @GetMapping
    public List<User> getUsers() {
        return repo.findAll();
    }
}
