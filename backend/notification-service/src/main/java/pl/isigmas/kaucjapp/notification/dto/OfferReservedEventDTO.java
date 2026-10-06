package pl.isigmas.kaucjapp.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferReservedEventDTO {
    private Long offerId;
    private Long creatorId;
    private Long collectorId;
    private int totalQuantity;
}
