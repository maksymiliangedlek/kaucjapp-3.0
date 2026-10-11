package pl.isigmas.kaucjapp.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.auth.dto.request.AvailabilityRequest;
import pl.isigmas.kaucjapp.auth.dto.request.LoginCredentials;
import pl.isigmas.kaucjapp.auth.dto.request.ResetPasswordEmailRequest;
import pl.isigmas.kaucjapp.auth.dto.response.AvailabilityResponse;
import pl.isigmas.kaucjapp.auth.service.AuthService;
import pl.isigmas.kaucjapp.auth.dto.request.User;
import pl.isigmas.kaucjapp.auth.service.AvailabilityLimiter;
import pl.isigmas.kaucjapp.auth.service.LoginLimiter;
import pl.isigmas.kaucjapp.common.logger.Logger;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final LoginLimiter loginLimitter;
    private final AvailabilityLimiter availabilityLimiter;
    private final Logger logger;

    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("Ready");
    }

    @GetMapping("/admin/status")
    public ResponseEntity<String> getAdminStatus() {
        return ResponseEntity.ok("Admin allowed");
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody User newUser
    ) {
        service.create(newUser);
        log.info("New user created");
        logger.info("New user created");

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/availability")
    public ResponseEntity<?> availability(
            @Valid @RequestBody AvailabilityRequest request,
            HttpServletRequest httpRequest
    ) {
        String clientIp = clientIp(httpRequest);
        if (availabilityLimiter.isBlocked(clientIp)) {
            long timeLeft = availabilityLimiter.getRemainingMinutes(clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many availability checks. Please try again in " + timeLeft + " minutes");
        }

        availabilityLimiter.increment(clientIp);
        AvailabilityResponse response = service.checkAvailability(request);
        return ResponseEntity.ok(response);
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote == null ? "unknown" : remote;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginCredentials credentials
            ) {
        if (loginLimitter.isBlocked(credentials.getIdentifier().toLowerCase().trim())) {
            long timeLeft = loginLimitter.getRemainingAlertTime(credentials.getIdentifier());

            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many login attempts. Please try again in " + timeLeft + " minutes");
        }

        loginLimitter.incrementAttempts(credentials.getIdentifier().toLowerCase().trim());
        String token = service.login(credentials);

        logger.important("Login successful " + credentials.getIdentifier());
        loginLimitter.clearAttempts(credentials.getIdentifier().toLowerCase().trim());

        return ResponseEntity.ok(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody String token) {
        service.logout(token);
        log.info("Logout successful");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@RequestBody String token) {
        String newToken = service.generateJWT(token);
        log.info("Refresh successful");

        return ResponseEntity.ok(newToken);
    }

    @GetMapping("/activate/{token}")
    public ResponseEntity<Void> activate(@PathVariable String token) {
        service.activate(token);
        log.info("Activate successful");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<Void> sendResetPasswordEmail(
            @Valid @RequestBody ResetPasswordEmailRequest request
    ) {
        service.sendResetPasswordEmail(request.getEmailTo());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/resetpassword/{token}")
    public ResponseEntity<Void> resetPassword(
            @PathVariable String token,
            @RequestBody @NotBlank(message = "New password cannot be empty") String newPassword
    ) {
        service.resetPassword(token, newPassword);

        return ResponseEntity.ok().build();
    }
}
