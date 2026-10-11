package pl.isigmas.kaucjapp.auth.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import pl.isigmas.kaucjapp.auth.validation.CleanUsername;

@Data
public class AvailabilityRequest {

    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 6, max = 100)
    @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "Username can only contain letters and numbers")
    @CleanUsername
    private String username;

    @AssertTrue(message = "Email or username is required")
    public boolean isEmailOrUsernamePresent() {
        return !blank(email) || !blank(username);
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
