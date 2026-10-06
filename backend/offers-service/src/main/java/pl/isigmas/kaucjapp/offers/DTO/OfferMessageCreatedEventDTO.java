package pl.isigmas.kaucjapp.offers.DTO;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@RegisterReflectionForBinding
public class OfferMessageCreatedEventDTO {
    private Long offerId;
    private Long creatorId;
    private Long messageId;
    private Long senderId;
    private Long recipientId;
    private String preview;
}
