package pl.isigmas.kaucjapp.notification.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_notifications")
@Getter
@Setter
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class UserNotification {

    @Id
    @Column(name = "id")
    @EqualsAndHashCode.Include
    private UUID id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank
    @Column(name = "type", nullable = false, length = 64)
    private String type;

    @NotBlank
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @NotBlank
    @Column(name = "data_json", nullable = false, columnDefinition = "TEXT")
    private String dataJson;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "read_at")
    private Instant readAt;
}
