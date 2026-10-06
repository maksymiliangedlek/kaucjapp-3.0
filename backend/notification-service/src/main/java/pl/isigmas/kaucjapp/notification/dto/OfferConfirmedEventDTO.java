package pl.isigmas.kaucjapp.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferConfirmedEventDTO {
    private Long offerId;
    private Long creatorId;
    private Long collectorId;
    private Long confirmedById;
    private boolean completed;
}
