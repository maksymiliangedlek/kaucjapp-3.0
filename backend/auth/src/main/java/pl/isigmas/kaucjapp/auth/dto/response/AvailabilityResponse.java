package pl.isigmas.kaucjapp.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
    private Boolean emailAvailable;
    private Boolean usernameAvailable;
}
