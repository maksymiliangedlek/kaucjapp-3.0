package pl.isigmas.kaucjapp.users.DTO;

import java.time.LocalDate;

/** Projection for native daily series query. */
public interface DailyStatRow {
    LocalDate getStatDate();
    Long getReturnedTotal();
}
