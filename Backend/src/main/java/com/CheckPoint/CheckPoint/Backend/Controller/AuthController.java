package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.AuthDTOs.*;
import com.CheckPoint.CheckPoint.Backend.Model.PasswordResetToken;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Repository.PasswordResetTokenRepository;
import com.CheckPoint.CheckPoint.Backend.Security.JwtUtil;
import com.CheckPoint.CheckPoint.Backend.Service.EmailService;
import com.CheckPoint.CheckPoint.Backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins =
        {
                "http://127.0.0.1:5500/","http://localhost:5173/"
        })
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.createUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName());

            String jwt = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userResponse(user));
            response.put("message", "Registration successful");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            userService.updateLastLoginByEmail(request.getEmail());

            User user = userService.getUserByEmail(request.getEmail());

            String jwt = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userResponse(user));
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            Optional<User> userOpt = userService.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email not found");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userOpt.get();

            tokenRepository.deleteByUser_Id(user.getId());

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            tokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password reset email sent");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to send reset email");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());
            if (tokenOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid reset token");
                return ResponseEntity.badRequest().body(error);
            }

            PasswordResetToken resetToken = tokenOpt.get();
            if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Reset token has expired");
                return ResponseEntity.badRequest().body(error);
            }

            User user = resetToken.getUser();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userService.updateUser(user);

            tokenRepository.delete(resetToken);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password reset successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to reset password");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<?> oauth2LoginSuccess(OAuth2AuthenticationToken token) {
        try {
            String email = token.getPrincipal().getAttribute("email");
            String name = token.getPrincipal().getAttribute("name");
            String googleId = token.getPrincipal().getAttribute("sub");
            String profileImageUrl = token.getPrincipal().getAttribute("picture");

            if (email == null || googleId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Failed to extract user information from Google");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userService.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);

                if (name != null && !name.trim().isEmpty()) {
                    String[] nameParts = name.trim().split("\\s+", 2);
                    newUser.setFirstName(nameParts[0]);
                    newUser.setLastName(nameParts.length > 1 ? nameParts[1] : "");
                } else {
                    newUser.setFirstName("User");
                    newUser.setLastName("");
                }

                newUser.setGoogleId(googleId);
                newUser.setLoginMethod("GOOGLE");
                newUser.setProfileImageUrl(profileImageUrl);

                return userService.createUserOAuth(newUser);
            });

            userService.updateLastLoginByEmail(email);

            user = userService.getUserByEmail(email);

            String jwt = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userResponse(user));
            response.put("message", "Login successful via Google");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "OAuth2 authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private Map<String, Object> userResponse(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("firstName", user.getFirstName());
        map.put("lastName", user.getLastName());
        map.put("createdAt", user.getCreatedAt());
        map.put("lastLogin", user.getLastLogin());
        map.put("loginMethod", user.getLoginMethod());
        map.put("profileImageUrl", user.getProfileImageUrl());
        return map;
    }
}