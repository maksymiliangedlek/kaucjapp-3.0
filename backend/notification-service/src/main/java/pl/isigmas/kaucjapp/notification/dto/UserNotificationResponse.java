package pl.isigmas.kaucjapp.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class UserNotificationResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("type")
    private String type;

    @JsonProperty("title")
    private String title;

    @JsonProperty("body")
    private String body;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("read_at")
    private Instant readAt;

    @JsonProperty("data")
    private Map<String, String> data;
}
