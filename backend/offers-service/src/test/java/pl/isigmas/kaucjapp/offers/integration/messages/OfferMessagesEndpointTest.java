package pl.isigmas.kaucjapp.offers.integration.messages;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferMessagesEndpointTest extends BaseIntegrationTest {

    @Test
    void listMessages_withoutAfter_returnsLatestPageInAscendingOrder() throws Exception {
        Long creatorId = 71001L;
        Long collectorId = 71002L;
        Long offerId = reserveOffer(creatorId, collectorId);

        postMessage(offerId, collectorId, "one", null);
        postMessage(offerId, creatorId, "two", null);
        long thirdId = postMessage(offerId, collectorId, "three", null);

        mockMvc.perform(get("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", creatorId)
                        .param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].body").value("two"))
                .andExpect(jsonPath("$[1].body").value("three"))
                .andExpect(jsonPath("$[1].message_id").value(thirdId))
                .andExpect(jsonPath("$[0].message_id").value(org.hamcrest.Matchers.lessThan((int) thirdId)));
    }

    @Test
    void listMessages_withAfter_returnsFollowingPage() throws Exception {
        Long creatorId = 72001L;
        Long collectorId = 72002L;
        Long offerId = reserveOffer(creatorId, collectorId);

        long firstId = postMessage(offerId, collectorId, "one", null);
        postMessage(offerId, creatorId, "two", null);
        long thirdId = postMessage(offerId, collectorId, "three", null);

        mockMvc.perform(get("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", collectorId)
                        .param("after", String.valueOf(firstId))
                        .param("limit", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].body").value("two"));

        mockMvc.perform(get("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", collectorId)
                        .param("after", String.valueOf(thirdId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void listMessages_asOutsider_returns403() throws Exception {
        Long creatorId = 73001L;
        Long collectorId = 73002L;
        Long outsiderId = 73003L;
        Long offerId = reserveOffer(creatorId, collectorId);

        mockMvc.perform(get("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", outsiderId))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("OFFER_007"));
    }

    @Test
    void postMessage_onOpenOffer_returns409() throws Exception {
        Long creatorId = 74001L;
        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "body": "too early" }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error_code").value("OFFER_008"));
    }

    @Test
    void postMessage_duplicateClientMessageId_returnsExistingMessage() throws Exception {
        Long creatorId = 75001L;
        Long collectorId = 75002L;
        Long offerId = reserveOffer(creatorId, collectorId);
        UUID clientMessageId = UUID.randomUUID();

        long firstId = postMessage(offerId, collectorId, "hello", clientMessageId);

        mockMvc.perform(post("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", collectorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "a different retry body",
                                  "client_message_id": "%s"
                                }
                                """.formatted(clientMessageId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message_id").value(firstId))
                .andExpect(jsonPath("$.body").value("hello"))
                .andExpect(jsonPath("$.sender_id").value(collectorId))
                .andExpect(jsonPath("$.offer_id").value(offerId))
                .andExpect(jsonPath("$.client_message_id").value(clientMessageId.toString()));

        mockMvc.perform(get("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void listMessages_afterCancel_keepsHistoryAndRejectsNewMessages() throws Exception {
        Long creatorId = 76001L;
        Long collectorId = 76002L;
        Long offerId = reserveOffer(creatorId, collectorId);
        postMessage(offerId, collectorId, "on my way", null);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/CANCELED")
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].body").value("on my way"));

        mockMvc.perform(post("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "body": "too late" }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error_code").value("OFFER_008"));
    }

    @Test
    void postMessage_withReplyToSameOffer_returnsPreview() throws Exception {
        Long creatorId = 77001L;
        Long collectorId = 77002L;
        Long offerId = reserveOffer(creatorId, collectorId);
        long originalId = postMessage(offerId, collectorId, "are you home?", null);

        mockMvc.perform(post("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "yes, come in",
                                  "reply_to_message_id": %d
                                }
                                """.formatted(originalId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.body").value("yes, come in"))
                .andExpect(jsonPath("$.reply_to.message_id").value(originalId))
                .andExpect(jsonPath("$.reply_to.sender_id").value(collectorId))
                .andExpect(jsonPath("$.reply_to.body").value("are you home?"));

        mockMvc.perform(get("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].reply_to.message_id").value(originalId))
                .andExpect(jsonPath("$[1].reply_to.body").value("are you home?"));
    }

    @Test
    void postMessage_withReplyToOtherOffer_returns400() throws Exception {
        Long creatorId = 78001L;
        Long collectorId = 78002L;
        Long otherCreatorId = 78003L;
        Long otherCollectorId = 78004L;

        Long offerId = reserveOffer(creatorId, collectorId);
        Long otherOfferId = reserveOffer(otherCreatorId, otherCollectorId);
        long foreignMessageId = postMessage(otherOfferId, otherCollectorId, "foreign", null);

        mockMvc.perform(post("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "should fail",
                                  "reply_to_message_id": %d
                                }
                                """.formatted(foreignMessageId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("OFFER_003"));
    }

    private long postMessage(Long offerId, Long userId, String body, UUID clientMessageId) throws Exception {
        String clientField = clientMessageId == null
                ? ""
                : ", \"client_message_id\": \"" + clientMessageId + "\"";
        String response = mockMvc.perform(post("/api/offer/" + offerId + "/messages")
                        .header("X-User-Id", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "body": "%s"%s }
                                """.formatted(body, clientField)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("message_id").asLong();
    }

    private Long reserveOffer(Long creatorId, Long collectorId) throws Exception {
        Long offerId = createOpenOffer(creatorId);
        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());
        return offerId;
    }

    private Long createOpenOffer(Long creatorId) throws Exception {
        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickup_address": "ul. Odbiorcza 1",
                    "pickup_instructions": "Test",
                    "items": [
                      { "bottle_id": %d, "quantity": 1, "unit_price": 0.10 }
                    ]
                }
                """.formatted(plasticBottleId);

        String response = mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return Long.parseLong(response.trim());
    }
}
