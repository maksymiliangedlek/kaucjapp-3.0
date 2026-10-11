package pl.isigmas.kaucjapp.users.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.listener.UsersKafkaListener;
import pl.isigmas.kaucjapp.users.repository.UserRepository;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @MockitoBean
    private KafkaTemplate<String, String> kafkaTemplate;

    protected MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    private UsersKafkaListener usersKafkaListener;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUpBase() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    public void postCreateUser(String jsonBody) throws Exception {
        JsonNode node = objectMapper.readTree(jsonBody);
        CreateUserDTO.CreateUserDTOBuilder builder = CreateUserDTO.builder()
                .id(node.get("user_id").asLong())
                .username(node.get("username").asText())
                .firstName(node.has("first_name") ? node.get("first_name").asText()
                        : node.has("firstName") ? node.get("firstName").asText() : null)
                .lastName(node.has("last_name") ? node.get("last_name").asText()
                        : node.has("lastName") ? node.get("lastName").asText() : null)
                .phone(node.has("phone") ? node.get("phone").asText() : null)
                .email(node.get("email").asText());
        if (node.has("share_phone_on_reservation")) {
            builder.sharePhoneOnReservation(node.get("share_phone_on_reservation").asBoolean());
        } else if (node.has("sharePhoneOnReservation")) {
            builder.sharePhoneOnReservation(node.get("sharePhoneOnReservation").asBoolean());
        }
        usersKafkaListener.handleUserSync(objectMapper.writeValueAsString(builder.build()));
    }

    public void deleteUser(Long userId) {
        usersKafkaListener.handleUserDeleteCommand(String.valueOf(userId));
    }
}
