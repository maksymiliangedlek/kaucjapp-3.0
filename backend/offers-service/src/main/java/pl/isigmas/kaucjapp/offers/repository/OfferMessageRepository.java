package pl.isigmas.kaucjapp.offers.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.offers.model.OfferMessage;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferMessageRepository extends JpaRepository<OfferMessage, Long> {

    Optional<OfferMessage> findByOffer_IdAndClientMessageId(Long offerId, UUID clientMessageId);

    List<OfferMessage> findByOffer_IdOrderByIdDesc(Long offerId, Pageable pageable);

    List<OfferMessage> findByOffer_IdAndIdGreaterThanOrderByIdAsc(Long offerId, Long after, Pageable pageable);
}
