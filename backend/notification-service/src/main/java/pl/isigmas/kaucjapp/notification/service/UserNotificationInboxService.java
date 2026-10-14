package pl.isigmas.kaucjapp.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.notification.dto.UserNotificationResponse;
import pl.isigmas.kaucjapp.notification.entity.UserNotification;
import pl.isigmas.kaucjapp.notification.repository.UserNotificationRepository;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserNotificationInboxService {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, String>> DATA_TYPE = new TypeReference<>() {
    };

    private final UserNotificationRepository repository;

    @Transactional
    public void record(Long userId, String title, String body, Map<String, String> data) {
        String type = data == null ? "UNKNOWN" : data.getOrDefault("type", "UNKNOWN");
        String json;
        try {
            json = MAPPER.writeValueAsString(data == null ? Map.of() : data);
        } catch (JsonProcessingException e) {
            json = "{}";
        }
        repository.save(UserNotification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .dataJson(json)
                .createdAt(Instant.now())
                .build());
    }

    @Transactional(readOnly = true)
    public List<UserNotificationResponse> list(Long userId, int limit) {
        int pageSize = Math.min(Math.max(limit, 1), 100);
        return repository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, pageSize))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return repository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public boolean markRead(Long userId, UUID id) {
        return repository.findByIdAndUserId(id, userId)
                .map(n -> {
                    if (n.getReadAt() == null) {
                        n.setReadAt(Instant.now());
                        repository.save(n);
                    }
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public int markAllRead(Long userId) {
        return repository.markAllRead(userId, Instant.now());
    }

    @Transactional
    public void deleteForUser(Long userId) {
        repository.deleteByUserId(userId);
    }

    private UserNotificationResponse toResponse(UserNotification n) {
        Map<String, String> data;
        try {
            data = MAPPER.readValue(n.getDataJson(), DATA_TYPE);
        } catch (JsonProcessingException e) {
            data = Collections.emptyMap();
        }
        return UserNotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .body(n.getBody())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .data(data)
                .build();
    }
}
