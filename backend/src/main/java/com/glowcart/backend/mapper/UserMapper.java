package com.glowcart.backend.mapper;

import com.glowcart.backend.dto.request.RegisterRequest;
import com.glowcart.backend.dto.response.UserResponse;
import com.glowcart.backend.entity.User;

public class UserMapper {

    private UserMapper() {
        // Private constructor prevents instantiation — utility class
    }

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static User toEntity(RegisterRequest request) {
        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword()) // Will be encoded in the service layer
                .build();
    }
}