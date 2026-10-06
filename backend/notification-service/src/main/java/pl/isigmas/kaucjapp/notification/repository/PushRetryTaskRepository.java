package pl.isigmas.kaucjapp.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.notification.entity.PushRetryTask;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PushRetryTaskRepository extends JpaRepository<PushRetryTask, UUID> {

    List<PushRetryTask> findByNextAttemptAtLessThanEqual(Instant now);
}
