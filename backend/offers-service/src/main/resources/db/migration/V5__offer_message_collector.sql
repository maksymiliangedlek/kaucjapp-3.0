ALTER TABLE offer_messages ADD COLUMN collector_id BIGINT;

UPDATE offer_messages m
SET collector_id = o.collector_id
FROM offers o
WHERE o.offer_id = m.offer_id;

CREATE INDEX idx_offer_messages_offer_collector ON offer_messages (offer_id, collector_id, message_id);
