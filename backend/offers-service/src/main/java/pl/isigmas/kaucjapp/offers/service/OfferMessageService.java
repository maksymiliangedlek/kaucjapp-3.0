package pl.isigmas.kaucjapp.offers.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.DTO.CreateOfferMessageDTO;
import pl.isigmas.kaucjapp.offers.DTO.OfferMessageReplyPreviewDTO;
import pl.isigmas.kaucjapp.offers.DTO.OfferMessageResponseDTO;
import pl.isigmas.kaucjapp.offers.exception.OfferForbiddenException;
import pl.isigmas.kaucjapp.offers.exception.OfferNotFoundException;
import pl.isigmas.kaucjapp.offers.exception.OfferStateException;
import pl.isigmas.kaucjapp.offers.exception.OfferValidationException;
import pl.isigmas.kaucjapp.offers.model.Offer;
import pl.isigmas.kaucjapp.offers.model.OfferMessage;
import pl.isigmas.kaucjapp.offers.model.OfferStatus;
import pl.isigmas.kaucjapp.offers.repository.OfferMessageRepository;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferMessageService {

    private static final int MAX_LIMIT = 100;
    private static final Set<OfferStatus> WRITABLE_STATUSES = EnumSet.of(
            OfferStatus.RESERVED,
            OfferStatus.PENDING_CONFIRMATION,
            OfferStatus.COMPLAINT
    );

    private final OfferRepository offerRepository;
    private final OfferMessageRepository messageRepository;
    private final Logger logger;

    @Transactional(readOnly = true)
    public List<OfferMessageResponseDTO> list(Long offerId, Long userId, Long after, int limit) {
        loadPartyOffer(offerId, userId);
        int size = Math.min(Math.max(limit, 1), MAX_LIMIT);
        var page = PageRequest.of(0, size);
        List<OfferMessage> messages = after == null
                ? new ArrayList<>(messageRepository.findByOffer_IdOrderByIdDesc(offerId, page))
                : messageRepository.findByOffer_IdAndIdGreaterThanOrderByIdAsc(offerId, after, page);
        if (after == null) {
            Collections.reverse(messages);
        }
        return messages.stream().map(this::toDto).toList();
    }

    @Transactional
    public SendResult send(Long offerId, Long userId, CreateOfferMessageDTO request) {
        String body = request.getBody();
        UUID clientMessageId = request.getClientMessageId();
        Long replyToMessageId = request.getReplyToMessageId();

        Offer offer = loadPartyOffer(offerId, userId);

        if (clientMessageId != null) {
            Optional<OfferMessageResponseDTO> existing = messageRepository
                    .findByOffer_IdAndClientMessageId(offerId, clientMessageId)
                    .map(this::toDto);
            if (existing.isPresent()) {
                return new SendResult(existing.get(), false);
            }
        }

        if (!WRITABLE_STATUSES.contains(offer.getStatus())) {
            log.warn("Message rejected for offer ID: {} with status {}", offerId, offer.getStatus());
            logger.warn("Message rejected for offer ID: %d with status %s".formatted(offerId, offer.getStatus()));
            throw new OfferStateException(
                    "Messages can be sent only while the offer is RESERVED, PENDING_CONFIRMATION or COMPLAINT");
        }

        OfferMessage replyTo = resolveReplyTarget(offerId, replyToMessageId);
        return new SendResult(insert(offerId, userId, body, clientMessageId, replyTo), true);
    }

    private OfferMessage resolveReplyTarget(Long offerId, Long replyToMessageId) {
        if (replyToMessageId == null) {
            return null;
        }
        OfferMessage target = messageRepository.findById(replyToMessageId).orElseThrow(() -> {
            log.warn("Reply target not found, message ID: {} for offer ID: {}", replyToMessageId, offerId);
            logger.warn("Reply target not found, message ID: %d for offer ID: %d".formatted(replyToMessageId, offerId));
            return new OfferValidationException("Reply target message does not belong to this offer");
        });
        if (!Objects.equals(target.getOffer().getId(), offerId)) {
            log.warn("Reply target message ID: {} is outside offer ID: {}", replyToMessageId, offerId);
            logger.warn("Reply target message ID: %d is outside offer ID: %d".formatted(replyToMessageId, offerId));
            throw new OfferValidationException("Reply target message does not belong to this offer");
        }
        return target;
    }

    private OfferMessageResponseDTO insert(
            Long offerId,
            Long userId,
            String body,
            UUID clientMessageId,
            OfferMessage replyTo
    ) {
        OfferMessage message = new OfferMessage();
        message.setOffer(offerRepository.getReferenceById(offerId));
        message.setSenderId(userId);
        message.setBody(body);
        message.setClientMessageId(clientMessageId);
        message.setReplyTo(replyTo);
        OfferMessage saved = messageRepository.saveAndFlush(message);
        log.info("Offer message stored for offer ID: {} by user ID: {}", offerId, userId);
        logger.info("Offer message stored for offer ID: %d by user ID: %d".formatted(offerId, userId));
        return toDto(saved);
    }

    private Offer loadPartyOffer(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId).orElseThrow(() -> {
            log.warn("Offer not found, ID: {}", offerId);
            logger.warn("Offer not found, ID: %d".formatted(offerId));
            return new OfferNotFoundException(offerId);
        });
        if (!Objects.equals(offer.getCreatorId(), userId) && !Objects.equals(offer.getCollectorId(), userId)) {
            log.warn("Messages forbidden for offer ID: {} by user ID: {}", offerId, userId);
            logger.warn("Messages forbidden for offer ID: %d by user ID: %d".formatted(offerId, userId));
            throw new OfferForbiddenException("Only offer creator or collector can use this chat");
        }
        return offer;
    }

    private OfferMessageResponseDTO toDto(OfferMessage message) {
        return OfferMessageResponseDTO.builder()
                .messageId(message.getId())
                .offerId(message.getOffer().getId())
                .senderId(message.getSenderId())
                .body(message.getBody())
                .createdAt(message.getCreatedAt())
                .clientMessageId(message.getClientMessageId())
                .replyTo(toReplyPreview(message.getReplyTo()))
                .build();
    }

    private OfferMessageReplyPreviewDTO toReplyPreview(OfferMessage replyTo) {
        if (replyTo == null) {
            return null;
        }
        return OfferMessageReplyPreviewDTO.builder()
                .messageId(replyTo.getId())
                .senderId(replyTo.getSenderId())
                .body(replyTo.getBody())
                .build();
    }

    public record SendResult(OfferMessageResponseDTO message, boolean created) {
    }
}
