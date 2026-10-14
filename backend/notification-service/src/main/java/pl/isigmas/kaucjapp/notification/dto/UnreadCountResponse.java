package pl.isigmas.kaucjapp.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UnreadCountResponse {

    @JsonProperty("count")
    private long count;
}
