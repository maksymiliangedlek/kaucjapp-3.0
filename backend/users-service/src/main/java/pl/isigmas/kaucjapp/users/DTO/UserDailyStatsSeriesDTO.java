package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserDailyStatsSeriesDTO {

    @JsonProperty("days")
    private List<UserDailyStatPointDTO> days;
}
