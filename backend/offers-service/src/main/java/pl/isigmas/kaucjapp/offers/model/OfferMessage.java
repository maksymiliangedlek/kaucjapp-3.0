package pl.isigmas.kaucjapp.offers.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "offer_messages",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_offer_messages_client_id",
                columnNames = {"offer_id", "client_message_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"offer", "replyTo"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OfferMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "body", nullable = false, length = 1000)
    private String body;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "client_message_id")
    private UUID clientMessageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_message_id")
    private OfferMessage replyTo;
}
