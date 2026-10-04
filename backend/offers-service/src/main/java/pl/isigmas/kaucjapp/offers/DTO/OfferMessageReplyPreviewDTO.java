package pl.isigmas.kaucjapp.offers.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferMessageReplyPreviewDTO {
    private Long messageId;
    private Long senderId;
    private String body;
}
