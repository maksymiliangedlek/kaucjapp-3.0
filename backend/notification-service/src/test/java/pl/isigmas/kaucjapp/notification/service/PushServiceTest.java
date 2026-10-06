package pl.isigmas.kaucjapp.notification.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.notification.entity.PushRetryTask;
import pl.isigmas.kaucjapp.notification.entity.PushToken;
import pl.isigmas.kaucjapp.notification.repository.PushRetryTaskRepository;
import pl.isigmas.kaucjapp.notification.repository.PushTokenRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PushServiceTest {

    private static final Map<String, String> DATA = Map.of("type", "OFFER_RESERVED", "offerId", "7");

    @Mock
    private ExpoPushClient expoPushClient;
    @Mock
    private PushTokenRepository pushTokenRepository;
    @Mock
    private PushRetryTaskRepository pushRetryTaskRepository;
    @Mock
    private Logger logger;

    @InjectMocks
    private PushService pushService;

    @Test
    void registerToken_reassignsExistingTokenToCurrentUser() {
        PushToken existing = PushToken.builder().token("ExponentPushToken[a]").userId(1L).platform("ios").build();
        when(pushTokenRepository.findById("ExponentPushToken[a]")).thenReturn(Optional.of(existing));

        pushService.registerToken(2L, "ExponentPushToken[a]", "ios");

        ArgumentCaptor<PushToken> captor = ArgumentCaptor.forClass(PushToken.class);
        verify(pushTokenRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(2L);
    }

    @Test
    void unregisterToken_deletesOnlyForOwner() {
        pushService.unregisterToken(5L, "ExponentPushToken[a]");

        verify(pushTokenRepository).deleteByTokenAndUserId("ExponentPushToken[a]", 5L);
    }

    @Test
    void sendToUser_withoutTokens_doesNothing() {
        when(pushTokenRepository.findByUserId(1L)).thenReturn(List.of());

        pushService.sendToUser(1L, "T", "B", DATA);

        verifyNoInteractions(expoPushClient, pushRetryTaskRepository);
    }

    @Test
    void sendToUser_sendsToAllDevicesAndDeletesUnregisteredTokens() {
        when(pushTokenRepository.findByUserId(1L)).thenReturn(List.of(
                PushToken.builder().token("ExponentPushToken[a]").userId(1L).platform("ios").build(),
                PushToken.builder().token("ExponentPushToken[b]").userId(1L).platform("ios").build()));
        when(expoPushClient.send(List.of("ExponentPushToken[a]", "ExponentPushToken[b]"), "T", "B", DATA))
                .thenReturn(List.of("ExponentPushToken[b]"));

        pushService.sendToUser(1L, "T", "B", DATA);

        verify(pushTokenRepository).deleteAllById(List.of("ExponentPushToken[b]"));
        verify(pushRetryTaskRepository, never()).save(any());
    }

    @Test
    void sendToUser_onTransientFailure_storesRetryTask() {
        when(pushTokenRepository.findByUserId(1L)).thenReturn(List.of(
                PushToken.builder().token("ExponentPushToken[a]").userId(1L).platform("ios").build()));
        when(expoPushClient.send(anyList(), anyString(), anyString(), anyMap()))
                .thenThrow(new PushDeliveryException("down", null));

        pushService.sendToUser(1L, "T", "B", DATA);

        ArgumentCaptor<PushRetryTask> captor = ArgumentCaptor.forClass(PushRetryTask.class);
        verify(pushRetryTaskRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(1L);
        assertThat(captor.getValue().getAttemptCount()).isEqualTo(1);
        assertThat(captor.getValue().getData()).contains("\"offerId\":\"7\"");
    }
}
