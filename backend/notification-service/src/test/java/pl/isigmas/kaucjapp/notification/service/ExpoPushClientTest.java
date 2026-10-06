package pl.isigmas.kaucjapp.notification.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ExpoPushClientTest {

    private static final String URL = "https://exp.host/--/api/v2/push/send";
    private static final Map<String, String> DATA = Map.of("type", "OFFER_RESERVED", "offerId", "7");

    private MockRestServiceServer server;
    private ExpoPushClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl(URL);
        server = MockRestServiceServer.bindTo(builder).build();
        client = new ExpoPushClient(builder.build());
    }

    @Test
    void send_postsMessagePerTokenAndReturnsNoInvalidTokensOnSuccess() {
        server.expect(requestTo(URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$[0].to").value("ExponentPushToken[a]"))
                .andExpect(jsonPath("$[0].title").value("Tytuł"))
                .andExpect(jsonPath("$[0].data.offerId").value("7"))
                .andExpect(jsonPath("$[1].to").value("ExponentPushToken[b]"))
                .andRespond(withSuccess("{\"data\":[{\"status\":\"ok\",\"id\":\"1\"},{\"status\":\"ok\",\"id\":\"2\"}]}",
                        MediaType.APPLICATION_JSON));

        List<String> invalid = client.send(
                List.of("ExponentPushToken[a]", "ExponentPushToken[b]"), "Tytuł", "Treść", DATA);

        assertThat(invalid).isEmpty();
        server.verify();
    }

    @Test
    void send_returnsTokensReportedAsDeviceNotRegistered() {
        server.expect(requestTo(URL)).andRespond(withSuccess(
                "{\"data\":[{\"status\":\"ok\",\"id\":\"1\"},"
                        + "{\"status\":\"error\",\"message\":\"gone\",\"details\":{\"error\":\"DeviceNotRegistered\"}}]}",
                MediaType.APPLICATION_JSON));

        List<String> invalid = client.send(
                List.of("ExponentPushToken[a]", "ExponentPushToken[b]"), "T", "B", DATA);

        assertThat(invalid).containsExactly("ExponentPushToken[b]");
    }

    @Test
    void send_splitsTokensIntoBatchesOf100() {
        List<String> tokens = java.util.stream.IntStream.range(0, 101)
                .mapToObj(i -> "ExponentPushToken[" + i + "]").toList();
        server.expect(requestTo(URL)).andRespond(withSuccess("{\"data\":[]}", MediaType.APPLICATION_JSON));
        server.expect(requestTo(URL)).andExpect(content().string(org.hamcrest.Matchers.containsString("[100]")))
                .andRespond(withSuccess("{\"data\":[]}", MediaType.APPLICATION_JSON));

        client.send(tokens, "T", "B", DATA);

        server.verify();
    }

    @Test
    void send_serverErrorThrowsDeliveryExceptionSoCallerCanRetry() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.BAD_GATEWAY));

        assertThatThrownBy(() -> client.send(List.of("ExponentPushToken[a]"), "T", "B", DATA))
                .isInstanceOf(PushDeliveryException.class);
    }

    @Test
    void send_rateLimitThrowsDeliveryException() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

        assertThatThrownBy(() -> client.send(List.of("ExponentPushToken[a]"), "T", "B", DATA))
                .isInstanceOf(PushDeliveryException.class);
    }

    @Test
    void send_clientErrorIsNotRetried() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThat(client.send(List.of("ExponentPushToken[a]"), "T", "B", DATA)).isEmpty();
    }
}
