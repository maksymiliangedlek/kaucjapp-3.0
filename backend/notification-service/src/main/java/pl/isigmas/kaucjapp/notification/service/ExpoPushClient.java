package pl.isigmas.kaucjapp.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Thin client for the Expo Push API. Works on the JSON tree so no DTOs need native reflection hints.
 * Push tokens are never logged.
 */
@Slf4j
@Component
public class ExpoPushClient {

    static final int BATCH_SIZE = 100;
    private static final String DEVICE_NOT_REGISTERED = "DeviceNotRegistered";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RestClient restClient;

    @Autowired
    public ExpoPushClient(
            @Value("${app.push.expo-url}") String expoUrl,
            @Value("${app.push.access-token:}") String accessToken
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        RestClient.Builder builder = RestClient.builder().baseUrl(expoUrl).requestFactory(requestFactory);
        if (StringUtils.hasText(accessToken)) {
            builder.defaultHeader("Authorization", "Bearer " + accessToken);
        }
        this.restClient = builder.build();
    }

    ExpoPushClient(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Sends one notification to every token.
     *
     * @return tokens that Expo reported as no longer registered (to be deleted by the caller)
     * @throws PushDeliveryException when Expo is unreachable or answers 429/5xx
     */
    public List<String> send(List<String> tokens, String title, String body, Map<String, String> data) {
        List<String> invalidTokens = new ArrayList<>();
        for (int from = 0; from < tokens.size(); from += BATCH_SIZE) {
            List<String> batch = tokens.subList(from, Math.min(from + BATCH_SIZE, tokens.size()));
            sendBatch(batch, title, body, data, invalidTokens);
        }
        return invalidTokens;
    }

    private void sendBatch(
            List<String> batch,
            String title,
            String body,
            Map<String, String> data,
            List<String> invalidTokens
    ) {
        ArrayNode messages = MAPPER.createArrayNode();
        for (String token : batch) {
            ObjectNode message = messages.addObject();
            message.put("to", token);
            message.put("title", title);
            message.put("body", body);
            message.put("sound", "default");
            message.put("priority", "high");
            message.set("data", MAPPER.valueToTree(data));
        }

        String response;
        try {
            response = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(messages.toString())
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().is5xxServerError() || e.getStatusCode().value() == 429) {
                throw new PushDeliveryException("Expo Push API answered " + e.getStatusCode().value(), e);
            }
            // Other 4xx (e.g. 401 for a bad access token) cannot be fixed by retrying.
            log.error("Expo Push API rejected the request with status {}", e.getStatusCode().value());
            return;
        } catch (RestClientException e) {
            throw new PushDeliveryException("Expo Push API unreachable", e);
        }

        collectInvalidTokens(response, batch, invalidTokens);
    }

    private void collectInvalidTokens(String response, List<String> batch, List<String> invalidTokens) {
        if (!StringUtils.hasText(response)) {
            return;
        }
        try {
            JsonNode tickets = MAPPER.readTree(response).path("data");
            for (int i = 0; i < tickets.size() && i < batch.size(); i++) {
                JsonNode ticket = tickets.get(i);
                if ("error".equals(ticket.path("status").asText())) {
                    String error = ticket.path("details").path("error").asText();
                    if (DEVICE_NOT_REGISTERED.equals(error)) {
                        invalidTokens.add(batch.get(i));
                    } else {
                        log.warn("Expo push ticket error: {}", error);
                    }
                }
            }
        } catch (JsonProcessingException e) {
            log.warn("Unreadable Expo Push API response", e);
        }
    }
}
