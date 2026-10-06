package pl.isigmas.kaucjapp.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferMessageCreatedEventDTO {
    private Long offerId;
    private Long creatorId;
    private Long messageId;
    private Long senderId;
    private Long recipientId;
    private String preview;
}
