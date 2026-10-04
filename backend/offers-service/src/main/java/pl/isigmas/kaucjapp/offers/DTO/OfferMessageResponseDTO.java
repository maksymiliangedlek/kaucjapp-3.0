package pl.isigmas.kaucjapp.offers.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferMessageResponseDTO {
    private Long messageId;
    private Long offerId;
    private Long senderId;
    private String body;
    private Instant createdAt;
    private UUID clientMessageId;
    private OfferMessageReplyPreviewDTO replyTo;
}
