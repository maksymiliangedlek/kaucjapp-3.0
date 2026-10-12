ALTER TABLE users
    ADD COLUMN app_role VARCHAR(16) NULL,
    ADD COLUMN product_onboarding_completed BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN product_onboarding_completed_at TIMESTAMPTZ NULL;

ALTER TABLE users
    ADD CONSTRAINT users_app_role_check
        CHECK (app_role IS NULL OR app_role IN ('OFFERER', 'COLLECTOR', 'BOTH'));
