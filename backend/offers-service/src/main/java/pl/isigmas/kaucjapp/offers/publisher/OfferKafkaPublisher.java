package pl.isigmas.kaucjapp.offers.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.offers.DTO.OfferConfirmedEventDTO;
import pl.isigmas.kaucjapp.offers.DTO.OfferMessageCreatedEventDTO;
import pl.isigmas.kaucjapp.offers.DTO.OfferReservedEventDTO;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OfferKafkaPublisher {

    private static final int PUBLISH_TIMEOUT_SECONDS = 30;

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Logger logger;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendOfferReserved(OfferReservedEventDTO event) {
        sendAfterCommit("offers.reserved", event.getOfferId(), event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendOfferConfirmed(OfferConfirmedEventDTO event) {
        sendAfterCommit("offers.confirmed", event.getOfferId(), event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendOfferMessageCreated(OfferMessageCreatedEventDTO event) {
        sendAfterCommit("offers.message.created", event.getOfferId(), event);
    }

    /** Push triggers are best effort: the business change is already committed, so a failure is only logged. */
    private void sendAfterCommit(String topic, Long offerId, Object event) {
        try {
            kafkaTemplate.send(topic, offerId.toString(), event);
            log.info("Published {} for offer ID: {}", topic, offerId);
            logger.info("Published %s for offer ID: %d".formatted(topic, offerId));
        } catch (RuntimeException e) {
            log.error("Failed to publish {} for offer ID: {}", topic, offerId, e);
            logger.error("Failed to publish %s for offer ID: %d".formatted(topic, offerId));
        }
    }

    public void sendOfferCompleted(OfferCompletedEventDTO event) {
        try {
            kafkaTemplate
                    .send("offers.completed", event.getOfferId().toString(), event)
                    .get(PUBLISH_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            log.info(
                    "Published offers.completed for offer ID: {} (creator={}, collector={}, plastic={}, cans={})",
                    event.getOfferId(),
                    event.getCreatorId(),
                    event.getCollectorId(),
                    event.getPlasticQuantity(),
                    event.getCanQuantity()
            );
            logger.important("Published offers.completed for offer ID: %d".formatted(event.getOfferId()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "Interrupted while publishing offers.completed for offer ID: " + event.getOfferId(),
                    e
            );
        } catch (ExecutionException | TimeoutException e) {
            throw new IllegalStateException(
                    "Failed to publish offers.completed for offer ID: " + event.getOfferId(),
                    e
            );
        }
    }
}
