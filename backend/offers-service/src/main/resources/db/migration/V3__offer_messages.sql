CREATE TABLE offer_messages (
    message_id          BIGSERIAL PRIMARY KEY,
    offer_id            BIGINT NOT NULL REFERENCES offers(offer_id) ON DELETE CASCADE,
    sender_id           BIGINT NOT NULL,
    body                VARCHAR(1000) NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_message_id   UUID,
    CONSTRAINT uq_offer_messages_client_id UNIQUE (offer_id, client_message_id)
);

CREATE INDEX idx_offer_messages_offer_message ON offer_messages (offer_id, message_id);
