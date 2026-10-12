package pl.isigmas.kaucjapp.users.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.isigmas.kaucjapp.users.model.AppRole;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDTO {
    /** When present, must be non-blank; null means "do not change". */
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    private String firstName;

    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    private String lastName;

    /** When present, updates whether phone is shown to others on reservation; null means "do not change". */
    private Boolean sharePhoneOnReservation;

    /** When present, updates preferred app usage role; null means "do not change". */
    private AppRole appRole;

    /**
     * When true, marks product onboarding as completed (idempotent).
     * false/null means "do not change"; clients cannot reopen onboarding via this API.
     */
    private Boolean productOnboardingCompleted;

    @Valid
    private List<UserAddressDTO> addresses;
}
