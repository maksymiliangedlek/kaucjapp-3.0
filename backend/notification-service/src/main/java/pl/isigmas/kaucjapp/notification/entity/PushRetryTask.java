package pl.isigmas.kaucjapp.notification.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "push_retry_tasks")
@Getter
@Setter
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class PushRetryTask {

    @Id
    @Column(name = "task_id")
    @EqualsAndHashCode.Include
    private UUID id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Column(name = "body", nullable = false)
    private String body;

    /** JSON object with string values, delivered to the app as the notification payload. */
    @NotBlank
    @Column(name = "data", nullable = false)
    private String data;

    @NotNull
    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @NotNull
    @Column(name = "next_attempt_at", nullable = false)
    private Instant nextAttemptAt;

    @NotNull
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
