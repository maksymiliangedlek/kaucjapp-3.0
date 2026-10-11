package pl.isigmas.kaucjapp.users.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.model.Rating;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.model.UserStats;
import pl.isigmas.kaucjapp.users.repository.RatingRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;

import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private UserStatsRepository userStatsRepository;

    @Mock
    private Logger logger;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_persistsUserAndInitialUserStats() {
        // Given
        CreateUserDTO dto = CreateUserDTO.builder()
                .id(42L)
                .username("alice")
                .firstName("Al")
                .lastName("Ice")
                .phone("123456789")
                .email("alice@example.com")
                .build();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(dto.getUsername())).thenReturn(false);

        // When
        userService.createUser(dto.getId(), dto);

        // Then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());
        assertThat(userCaptor.getValue().isSharePhoneOnReservation()).isTrue();
        verify(ratingRepository, times(1)).save(any(Rating.class));
        verify(userStatsRepository, times(1)).save(any(UserStats.class));
    }

    @Test
    void createUser_respectsSharePhoneOnReservationFalse() {
        CreateUserDTO dto = CreateUserDTO.builder()
                .id(43L)
                .username("bob")
                .firstName("Bo")
                .lastName("B")
                .phone("987654321")
                .email("bob@example.com")
                .sharePhoneOnReservation(false)
                .build();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(dto.getUsername())).thenReturn(false);

        userService.createUser(dto.getId(), dto);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().isSharePhoneOnReservation()).isFalse();
    }
}
