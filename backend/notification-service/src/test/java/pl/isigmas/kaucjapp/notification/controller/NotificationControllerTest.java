package pl.isigmas.kaucjapp.notification.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.isigmas.kaucjapp.notification.service.PushService;
import pl.isigmas.kaucjapp.notification.service.WarningService;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private WarningService warningService;
    @Mock
    private PushService pushService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new NotificationController(warningService, pushService)).build();
    }

    @Test
    void registerPushToken_storesTokenForCaller() throws Exception {
        mockMvc.perform(put("/api/notification/push-token")
                        .header("X-User-Id", 5)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"ExponentPushToken[abc123]\",\"platform\":\"ios\"}"))
                .andExpect(status().isNoContent());

        verify(pushService).registerToken(5L, "ExponentPushToken[abc123]", "ios");
    }

    @Test
    void registerPushToken_rejectsMalformedToken() throws Exception {
        mockMvc.perform(put("/api/notification/push-token")
                        .header("X-User-Id", 5)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"not-a-token\",\"platform\":\"ios\"}"))
                .andExpect(status().isBadRequest());

        verify(pushService, never()).registerToken(any(), any(), any());
    }

    @Test
    void registerPushToken_rejectsUnknownPlatform() throws Exception {
        mockMvc.perform(put("/api/notification/push-token")
                        .header("X-User-Id", 5)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"ExponentPushToken[abc123]\",\"platform\":\"web\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unregisterPushToken_removesTokenOfCaller() throws Exception {
        mockMvc.perform(delete("/api/notification/push-token")
                        .header("X-User-Id", 5)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"ExponentPushToken[abc123]\"}"))
                .andExpect(status().isNoContent());

        verify(pushService).unregisterToken(5L, "ExponentPushToken[abc123]");
    }
}
