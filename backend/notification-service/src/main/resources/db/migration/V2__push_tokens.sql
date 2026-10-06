CREATE TABLE push_tokens (
    token       VARCHAR(255) PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    platform    VARCHAR(16) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

CREATE TABLE push_retry_tasks (
    task_id          UUID PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    title            VARCHAR(255) NOT NULL,
    body             TEXT NOT NULL,
    data             TEXT NOT NULL,
    attempt_count    INTEGER NOT NULL,
    next_attempt_at  TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_push_retry_tasks_next_attempt ON push_retry_tasks(next_attempt_at);
