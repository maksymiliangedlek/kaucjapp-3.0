package pl.isigmas.kaucjapp.users.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.UserReviewCreatedEventDTO;

@Slf4j
@Component
public class UserReviewCreatedKafkaPublisher {

    private static final String TOPIC = "users.review.created";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper kafkaObjectMapper;
    private final Logger logger;

    public UserReviewCreatedKafkaPublisher(
            KafkaTemplate<String, String> kafkaTemplate,
            @Qualifier("kafkaObjectMapper") ObjectMapper kafkaObjectMapper,
            Logger logger
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaObjectMapper = kafkaObjectMapper;
        this.logger = logger;
    }

    /** Push trigger is best effort: the review is already committed, so a failure is only logged. */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publishReviewCreated(UserReviewCreatedEventDTO event) {
        try {
            kafkaTemplate.send(TOPIC, String.valueOf(event.getRevieweeId()), kafkaObjectMapper.writeValueAsString(event));
            log.info("Published {} for review ID: {}", TOPIC, event.getReviewId());
            logger.info("Published %s for review ID: %d".formatted(TOPIC, event.getReviewId()));
        } catch (JsonProcessingException | RuntimeException e) {
            log.error("Failed to publish {} for review ID: {}", TOPIC, event.getReviewId(), e);
            logger.error("Failed to publish %s for review ID: %d".formatted(TOPIC, event.getReviewId()));
        }
    }
}
