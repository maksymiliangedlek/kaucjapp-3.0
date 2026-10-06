package pl.isigmas.kaucjapp.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.notification.dto.PushTokenRequest;
import pl.isigmas.kaucjapp.notification.entity.Warning;
import pl.isigmas.kaucjapp.notification.service.PushService;
import pl.isigmas.kaucjapp.notification.service.WarningService;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private static final Pattern EXPO_TOKEN = Pattern.compile("^Expo(nent)?PushToken\\[[^\\]\\s]{1,200}]$");
    private static final Set<String> PLATFORMS = Set.of("ios", "android");

    private final WarningService warningService;
    private final PushService pushService;

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Ready!");
    }

    @GetMapping("/admin/warnings")
    public ResponseEntity<List<Warning>> warnings() {

        List<Warning> warnings = warningService.getWarnings();

        return ResponseEntity.ok(warnings);
    }

    @PutMapping("/push-token")
    public ResponseEntity<Void> registerPushToken(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PushTokenRequest request) {
        if (!isValidToken(request.getToken()) || request.getPlatform() == null
                || !PLATFORMS.contains(request.getPlatform())) {
            return ResponseEntity.badRequest().build();
        }
        pushService.registerToken(userId, request.getToken(), request.getPlatform());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/push-token")
    public ResponseEntity<Void> unregisterPushToken(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PushTokenRequest request) {
        if (!isValidToken(request.getToken())) {
            return ResponseEntity.badRequest().build();
        }
        pushService.unregisterToken(userId, request.getToken());
        return ResponseEntity.noContent().build();
    }

    private boolean isValidToken(String token) {
        return token != null && EXPO_TOKEN.matcher(token).matches();
    }
}
