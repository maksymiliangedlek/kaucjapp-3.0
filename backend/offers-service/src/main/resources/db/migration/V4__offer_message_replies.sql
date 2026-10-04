ALTER TABLE offer_messages
    ADD COLUMN reply_to_message_id BIGINT
        REFERENCES offer_messages(message_id) ON DELETE SET NULL;

CREATE INDEX idx_offer_messages_reply_to ON offer_messages (reply_to_message_id);
