package pl.isigmas.kaucjapp.offers.model;

import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Native images run Hibernate without runtime bytecode generation, so lazy to-one
 * associations (which need proxies) crash at runtime with a 500. JVM tests cannot
 * reproduce that, so guard the mapping instead.
 */
class OfferMessageMappingTest {

    @Test
    void offerMessage_hasNoLazyToOneAssociations() {
        var lazyFields = Arrays.stream(OfferMessage.class.getDeclaredFields())
                .filter(OfferMessageMappingTest::isLazyManyToOne)
                .map(Field::getName)
                .toList();

        assertTrue(lazyFields.isEmpty(),
                "Lazy @ManyToOne needs runtime proxies, unsupported in native image: " + lazyFields);
    }

    private static boolean isLazyManyToOne(Field field) {
        ManyToOne annotation = field.getAnnotation(ManyToOne.class);
        return annotation != null && annotation.fetch() == FetchType.LAZY;
    }
}
