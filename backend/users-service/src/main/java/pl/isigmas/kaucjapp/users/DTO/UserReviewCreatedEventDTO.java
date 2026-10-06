package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserReviewCreatedEventDTO {
    private Long reviewId;
    private Long revieweeId;
    private Long reviewerId;
    private Long offerId;
    private BigDecimal score;
}
