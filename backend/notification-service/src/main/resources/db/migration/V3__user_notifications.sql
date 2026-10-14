CREATE TABLE user_notifications (
    id          UUID PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    type        VARCHAR(64) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT NOT NULL,
    data_json   TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL,
    read_at     TIMESTAMPTZ NULL
);

CREATE INDEX idx_user_notifications_user_created
    ON user_notifications (user_id, created_at DESC);

CREATE INDEX idx_user_notifications_user_unread
    ON user_notifications (user_id)
    WHERE read_at IS NULL;
