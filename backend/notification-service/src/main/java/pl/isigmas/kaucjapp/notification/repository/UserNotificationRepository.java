package pl.isigmas.kaucjapp.notification.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.notification.entity.UserNotification;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, UUID> {

    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndReadAtIsNull(Long userId);

    Optional<UserNotification> findByIdAndUserId(UUID id, Long userId);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE UserNotification n
            SET n.readAt = :now
            WHERE n.userId = :userId AND n.readAt IS NULL
            """)
    int markAllRead(@Param("userId") Long userId, @Param("now") Instant now);

    int deleteByUserId(Long userId);
}
