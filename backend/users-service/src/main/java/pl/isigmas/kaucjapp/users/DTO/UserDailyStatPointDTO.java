package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserDailyStatPointDTO {

    @JsonProperty("date")
    private LocalDate date;

    @JsonProperty("returned_total_count")
    private long returnedTotalCount;
}
