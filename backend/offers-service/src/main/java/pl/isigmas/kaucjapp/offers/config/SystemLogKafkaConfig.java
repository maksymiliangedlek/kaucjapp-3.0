package pl.isigmas.kaucjapp.offers.config;

import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.kafka.autoconfigure.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import pl.isigmas.kaucjapp.common.kafka.KafkaProducerConfigSupport;
import pl.isigmas.kaucjapp.common.logger.SystemLog;
import java.util.Map;

/**
 * Kafka producers: {@code @Primary} template for domain events (e.g. {@code offers.completed}, {@code offers.reserved}),
 * separate template for {@link pl.isigmas.kaucjapp.common.logger.Logger} (topic {@code system-logs}).
 */
@Configuration
@Profile("!test")
public class SystemLogKafkaConfig {

    private final Map<String, Object> baseProducerProperties;

    public SystemLogKafkaConfig(KafkaProperties kafkaProperties) {
        this.baseProducerProperties = kafkaProperties.buildProducerProperties();
    }

    @Bean
    @Primary
    public ProducerFactory<String, Object> offerEventProducerFactory() {
        return new DefaultKafkaProducerFactory<>(
                KafkaProducerConfigSupport.producerProps(
                        baseProducerProperties,
                        StringSerializer.class,
                        CustomKafkaJsonSerializer.class
                )
        );
    }

    @Bean
    @Primary
    public KafkaTemplate<String, Object> kafkaTemplate(
            ProducerFactory<String, Object> offerEventProducerFactory) {
        return new KafkaTemplate<>(offerEventProducerFactory);
    }

    @Bean
    public ProducerFactory<String, SystemLog> systemLogProducerFactory() {
        return new DefaultKafkaProducerFactory<>(
                KafkaProducerConfigSupport.producerProps(
                        baseProducerProperties,
                        StringSerializer.class,
                        CustomKafkaJsonSerializer.class
                )
        );
    }

    @Bean
    public KafkaTemplate<String, SystemLog> systemLogKafkaTemplate(
            ProducerFactory<String, SystemLog> systemLogProducerFactory) {
        return new KafkaTemplate<>(systemLogProducerFactory);
    }
}
