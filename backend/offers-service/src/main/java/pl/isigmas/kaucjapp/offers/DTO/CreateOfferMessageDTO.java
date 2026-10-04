package pl.isigmas.kaucjapp.offers.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOfferMessageDTO {

    @NotBlank
    @Size(max = 1000)
    private String body;

    @Setter
    private UUID clientMessageId;

    public void setBody(String body) {
        this.body = body == null ? null : body.trim();
    }
}
