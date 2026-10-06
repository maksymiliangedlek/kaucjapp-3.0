package pl.isigmas.kaucjapp.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.notification.entity.PushRetryTask;
import pl.isigmas.kaucjapp.notification.entity.PushToken;
import pl.isigmas.kaucjapp.notification.repository.PushRetryTaskRepository;
import pl.isigmas.kaucjapp.notification.repository.PushTokenRepository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushService {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, String>> DATA_TYPE = new TypeReference<>() {
    };

    private final ExpoPushClient expoPushClient;
    private final PushTokenRepository pushTokenRepository;
    private final PushRetryTaskRepository pushRetryTaskRepository;
    private final Logger logger;

    public void registerToken(Long userId, String token, String platform) {
        Instant now = Instant.now();
        PushToken pushToken = pushTokenRepository.findById(token)
                .orElseGet(() -> PushToken.builder().token(token).createdAt(now).build());
        pushToken.setUserId(userId);
        pushToken.setPlatform(platform);
        pushToken.setUpdatedAt(now);
        pushTokenRepository.save(pushToken);
        log.info("Push token registered for user ID: {} ({})", userId, platform);
        logger.info("Push token registered for user ID: %d (%s)".formatted(userId, platform));
    }

    public void unregisterToken(Long userId, String token) {
        if (pushTokenRepository.deleteByTokenAndUserId(token, userId) > 0) {
            log.info("Push token removed for user ID: {}", userId);
            logger.info("Push token removed for user ID: %d".formatted(userId));
        }
    }

    public void deleteUserTokens(Long userId) {
        int removed = pushTokenRepository.deleteByUserId(userId);
        log.info("Removed {} push tokens for deleted user ID: {}", removed, userId);
        logger.info("Removed %d push tokens for deleted user ID: %d".formatted(removed, userId));
    }

    /** Sends the notification to every device of the user; on a transient Expo failure a retry task is stored. */
    public void sendToUser(Long userId, String title, String body, Map<String, String> data) {
        if (!deliver(userId, title, body, data)) {
            scheduleRetry(userId, title, body, data);
        }
    }

    /** @return false when delivery failed transiently and should be retried */
    boolean deliver(Long userId, String title, String body, Map<String, String> data) {
        List<String> tokens = pushTokenRepository.findByUserId(userId).stream().map(PushToken::getToken).toList();
        if (tokens.isEmpty()) {
            return true;
        }
        try {
            List<String> invalidTokens = expoPushClient.send(tokens, title, body, data);
            if (!invalidTokens.isEmpty()) {
                pushTokenRepository.deleteAllById(invalidTokens);
                log.info("Removed {} unregistered push tokens of user ID: {}", invalidTokens.size(), userId);
            }
            return true;
        } catch (PushDeliveryException e) {
            log.warn("Push to user ID: {} failed transiently: {}", userId, e.getMessage());
            return false;
        }
    }

    boolean deliver(PushRetryTask task) {
        try {
            return deliver(task.getUserId(), task.getTitle(), task.getBody(), MAPPER.readValue(task.getData(), DATA_TYPE));
        } catch (JsonProcessingException e) {
            log.error("Discarding push retry task with unreadable data, user ID: {}", task.getUserId());
            return true;
        }
    }

    private void scheduleRetry(Long userId, String title, String body, Map<String, String> data) {
        Instant now = Instant.now();
        try {
            pushRetryTaskRepository.save(PushRetryTask.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .title(title)
                    .body(body)
                    .data(MAPPER.writeValueAsString(data))
                    .attemptCount(1)
                    .nextAttemptAt(now.plus(EmailRetryBackoffPolicy.intervalAfterAttempt(1)))
                    .createdAt(now)
                    .build());
            String message = "Push to user ID: %d failed (attempt 1/%d), scheduled retry"
                    .formatted(userId, EmailRetryBackoffPolicy.MAX_ATTEMPTS);
            log.warn(message);
            logger.warn(message);
        } catch (JsonProcessingException e) {
            log.error("Push to user ID: {} dropped, payload not serializable", userId, e);
        }
    }
}
