package pl.isigmas.kaucjapp.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.notification.entity.PushRetryTask;
import pl.isigmas.kaucjapp.notification.repository.PushRetryTaskRepository;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushRetryService {

    private final PushService pushService;
    private final PushRetryTaskRepository pushRetryTaskRepository;
    private final Logger logger;

    @Scheduled(fixedRate = 5000)
    public void processPendingRetries() {
        Instant now = Instant.now();
        for (PushRetryTask task : pushRetryTaskRepository.findByNextAttemptAtLessThanEqual(now)) {
            processTask(task, now);
        }
    }

    private void processTask(PushRetryTask task, Instant now) {
        if (pushService.deliver(task)) {
            pushRetryTaskRepository.delete(task);
            return;
        }

        int nextAttemptCount = task.getAttemptCount() + 1;
        if (nextAttemptCount > EmailRetryBackoffPolicy.MAX_ATTEMPTS) {
            pushRetryTaskRepository.delete(task);
            String discardMessage = "Push to user ID: %d discarded after %d failed attempts"
                    .formatted(task.getUserId(), EmailRetryBackoffPolicy.MAX_ATTEMPTS);
            log.warn(discardMessage);
            logger.error(discardMessage);
            return;
        }

        task.setAttemptCount(nextAttemptCount);
        task.setNextAttemptAt(now.plus(EmailRetryBackoffPolicy.intervalAfterAttempt(nextAttemptCount)));
        pushRetryTaskRepository.save(task);
        String retryMessage = "Push to user ID: %d failed (attempt %d/%d), next retry at %s".formatted(
                task.getUserId(),
                nextAttemptCount,
                EmailRetryBackoffPolicy.MAX_ATTEMPTS,
                task.getNextAttemptAt()
        );
        log.warn(retryMessage);
        logger.warn(retryMessage);
    }
}
