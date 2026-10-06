package pl.isigmas.kaucjapp.notification.listener;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.notification.dto.OfferConfirmedEventDTO;
import pl.isigmas.kaucjapp.notification.dto.OfferMessageCreatedEventDTO;
import pl.isigmas.kaucjapp.notification.dto.OfferReservedEventDTO;
import pl.isigmas.kaucjapp.notification.dto.UserReviewCreatedEventDTO;
import pl.isigmas.kaucjapp.notification.service.EmailRetryService;
import pl.isigmas.kaucjapp.notification.service.PushService;
import pl.isigmas.kaucjapp.notification.service.WarningService;

import java.math.BigDecimal;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationKafkaListenerTest {

    @Mock
    private EmailRetryService emailRetryService;
    @Mock
    private WarningService warningService;
    @Mock
    private PushService pushService;
    @Mock
    private Logger logger;

    @InjectMocks
    private NotificationKafkaListener listener;

    @Test
    void offerReserved_notifiesCreator() {
        listener.handleOfferReserved(OfferReservedEventDTO.builder()
                .offerId(7L).creatorId(10L).collectorId(20L).totalQuantity(5).build());

        verify(pushService).sendToUser(eq(10L), eq("Nowa rezerwacja"), anyString(),
                eq(Map.of("type", "OFFER_RESERVED", "offerId", "7", "role", "CREATOR")));
    }

    @Test
    void offerConfirmedByCreator_notifiesCollector() {
        listener.handleOfferConfirmed(OfferConfirmedEventDTO.builder()
                .offerId(7L).creatorId(10L).collectorId(20L).confirmedById(10L).completed(false).build());

        verify(pushService).sendToUser(eq(20L), eq("Potwierdzenie transakcji"), anyString(),
                eq(Map.of("type", "OFFER_CONFIRMED", "offerId", "7", "role", "COLLECTOR")));
    }

    @Test
    void offerConfirmedByCollectorAndCompleted_notifiesCreatorAboutCompletion() {
        listener.handleOfferConfirmed(OfferConfirmedEventDTO.builder()
                .offerId(7L).creatorId(10L).collectorId(20L).confirmedById(20L).completed(true).build());

        verify(pushService).sendToUser(eq(10L), eq("Oferta zakończona"), anyString(),
                eq(Map.of("type", "OFFER_COMPLETED", "offerId", "7", "role", "CREATOR")));
    }

    @Test
    void offerMessage_notifiesRecipientWithTheirRole() {
        listener.handleOfferMessageCreated(OfferMessageCreatedEventDTO.builder()
                .offerId(7L).creatorId(10L).messageId(1L).senderId(10L).recipientId(20L).preview("Cześć").build());

        verify(pushService).sendToUser(20L, "Nowa wiadomość", "Cześć",
                Map.of("type", "OFFER_MESSAGE", "offerId", "7", "role", "COLLECTOR"));
    }

    @Test
    void userReview_notifiesRevieweeWithFormattedScore() {
        listener.handleUserReviewCreated(UserReviewCreatedEventDTO.builder()
                .reviewId(1L).revieweeId(10L).reviewerId(20L).offerId(7L).score(new BigDecimal("4.50")).build());

        verify(pushService).sendToUser(10L, "Nowa opinia", "Otrzymałeś nową opinię: 4.5/5",
                Map.of("type", "USER_REVIEW", "offerId", "7"));
    }

    @Test
    void userDeleted_removesTokensOfThatUser() {
        listener.handleUserDeleted("\"42\"");

        verify(pushService).deleteUserTokens(42L);
    }
}
