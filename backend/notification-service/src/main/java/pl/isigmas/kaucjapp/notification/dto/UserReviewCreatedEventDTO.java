package pl.isigmas.kaucjapp.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReviewCreatedEventDTO {
    private Long reviewId;
    private Long revieweeId;
    private Long reviewerId;
    private Long offerId;
    private BigDecimal score;
}
