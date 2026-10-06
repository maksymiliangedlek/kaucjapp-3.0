package pl.isigmas.kaucjapp.notification.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.dto.WarningDTO;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.notification.dto.MailRequest;
import pl.isigmas.kaucjapp.notification.dto.OfferConfirmedEventDTO;
import pl.isigmas.kaucjapp.notification.dto.OfferMessageCreatedEventDTO;
import pl.isigmas.kaucjapp.notification.dto.OfferReservedEventDTO;
import pl.isigmas.kaucjapp.notification.dto.UserReviewCreatedEventDTO;
import pl.isigmas.kaucjapp.notification.service.EmailRetryService;
import pl.isigmas.kaucjapp.notification.service.PushService;
import pl.isigmas.kaucjapp.notification.service.WarningService;
import pl.isigmas.kaucjapp.notification.util.TemplateType;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class NotificationKafkaListener {

    private final EmailRetryService emailRetryService;
    private final WarningService warningService;
    private final PushService pushService;
    private final Logger logger;

    @KafkaListener(topics = "notification.mail.welcome", groupId = "notification-group")
    public void handleWelcomeEmail(MailRequest mailRequest) {
        emailRetryService.sendWithRetry(
                "Aktywacja konta",
                mailRequest.getUsername(),
                mailRequest.getEmailTo(),
                mailRequest.getMessage(),
                TemplateType.WELCOME
        );
    }

    @KafkaListener(topics = "notification.mail.resetpassword", groupId = "notification-group")
    public void handleResetPasswordEmail(MailRequest mailRequest) {
        emailRetryService.sendWithRetry(
                "Reset hasła",
                mailRequest.getUsername(),
                mailRequest.getEmailTo(),
                mailRequest.getMessage(),
                TemplateType.RESET_PASSWORD
        );
    }

    @KafkaListener(topics = "notification.admin", groupId = "notification-group")
    public void handleAdminNotification(WarningDTO warning) {
        warningService.saveWarning(warning);
    }

    @KafkaListener(topics = "offers.reserved", groupId = "notification-group")
    public void handleOfferReserved(OfferReservedEventDTO event) {
        pushService.sendToUser(
                event.getCreatorId(),
                "Nowa rezerwacja",
                "Ktoś zarezerwował Twoją ofertę (%d szt.)".formatted(event.getTotalQuantity()),
                pushData("OFFER_RESERVED", event.getOfferId(), "CREATOR")
        );
    }

    @KafkaListener(topics = "offers.confirmed", groupId = "notification-group")
    public void handleOfferConfirmed(OfferConfirmedEventDTO event) {
        boolean confirmedByCreator = Objects.equals(event.getConfirmedById(), event.getCreatorId());
        Long recipientId = confirmedByCreator ? event.getCollectorId() : event.getCreatorId();
        String role = confirmedByCreator ? "COLLECTOR" : "CREATOR";
        if (event.isCompleted()) {
            pushService.sendToUser(
                    recipientId,
                    "Oferta zakończona",
                    "Obie strony potwierdziły transakcję",
                    pushData("OFFER_COMPLETED", event.getOfferId(), role)
            );
            return;
        }
        pushService.sendToUser(
                recipientId,
                "Potwierdzenie transakcji",
                "Druga strona potwierdziła transakcję. Potwierdź ją również Ty",
                pushData("OFFER_CONFIRMED", event.getOfferId(), role)
        );
    }

    @KafkaListener(topics = "offers.message.created", groupId = "notification-group")
    public void handleOfferMessageCreated(OfferMessageCreatedEventDTO event) {
        String role = Objects.equals(event.getRecipientId(), event.getCreatorId()) ? "CREATOR" : "COLLECTOR";
        pushService.sendToUser(
                event.getRecipientId(),
                "Nowa wiadomość",
                event.getPreview(),
                pushData("OFFER_MESSAGE", event.getOfferId(), role)
        );
    }

    @KafkaListener(topics = "users.review.created", groupId = "notification-group")
    public void handleUserReviewCreated(UserReviewCreatedEventDTO event) {
        pushService.sendToUser(
                event.getRevieweeId(),
                "Nowa opinia",
                "Otrzymałeś nową opinię: %s/5".formatted(event.getScore().stripTrailingZeros().toPlainString()),
                pushData("USER_REVIEW", event.getOfferId(), null)
        );
    }

    @KafkaListener(topics = "users.deleted.event", groupId = "notification-group")
    public void handleUserDeleted(String idStr) {
        try {
            pushService.deleteUserTokens(Long.valueOf(idStr.replace("\"", "")));
        } catch (RuntimeException e) {
            logger.error("Failed to handle user deleted message: %s".formatted(idStr));
        }
    }

    private Map<String, String> pushData(String type, Long offerId, String role) {
        Map<String, String> data = new LinkedHashMap<>();
        data.put("type", type);
        data.put("offerId", String.valueOf(offerId));
        if (role != null) {
            data.put("role", role);
        }
        return data;
    }
}
