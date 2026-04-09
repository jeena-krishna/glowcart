package com.glowcart.backend.service;

import com.glowcart.backend.dto.request.LoginRequest;
import com.glowcart.backend.dto.request.RegisterRequest;
import com.glowcart.backend.dto.response.AuthResponse;
import com.glowcart.backend.dto.response.UserResponse;
import com.glowcart.backend.entity.User;
import com.glowcart.backend.exception.DuplicateResourceException;
import com.glowcart.backend.exception.ResourceNotFoundException;
import com.glowcart.backend.mapper.UserMapper;
import com.glowcart.backend.repository.UserRepository;
import com.glowcart.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "An account with email " + request.getEmail() + " already exists");
        }

        // 2. Create user entity from request
        User user = UserMapper.toEntity(request);

        // 3. Hash the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 4. Save to database
        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getEmail());

        // 5. Generate JWT token
        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        // 6. Return token + user info
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserMapper.toResponse(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());

        // 3. Generate JWT token
        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        // 4. Return token + user info
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserMapper.toResponse(user))
                .build();
    }

    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse promoteToAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        user.setRole(com.glowcart.backend.entity.Role.ADMIN);
        User saved = userRepository.save(user);
        log.info("User {} promoted to ADMIN", email);
        return UserMapper.toResponse(saved);
    }
}