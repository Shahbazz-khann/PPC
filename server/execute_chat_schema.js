require('dotenv').config();
const { pool } = require('./config/db');

const sql = `
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- =========================================================
-- 1. conversations
-- =========================================================

CREATE TABLE conversations (
    conversation_id BIGSERIAL PRIMARY KEY,

    created_by BIGINT NOT NULL,

    property_id BIGINT NULL,
    inspection_id BIGINT NULL,
    visit_id BIGINT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_conversations_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_conversations_property
        FOREIGN KEY (property_id)
        REFERENCES properties (property_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_conversations_inspection
        FOREIGN KEY (inspection_id)
        REFERENCES inspections (inspection_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_conversations_visit
        FOREIGN KEY (visit_id)
        REFERENCES property_visits (visit_id)
        ON DELETE SET NULL
);

CREATE INDEX idx_conversations_property_id
    ON conversations (property_id);

CREATE INDEX idx_conversations_inspection_id
    ON conversations (inspection_id);

CREATE INDEX idx_conversations_visit_id
    ON conversations (visit_id);

CREATE INDEX idx_conversations_created_by
    ON conversations (created_by);


-- =========================================================
-- 2. conversation_participants
-- =========================================================

CREATE TABLE conversation_participants (
    conversation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (conversation_id, user_id),

    CONSTRAINT fk_participants_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations (conversation_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_participants_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_conversation_participants_user_id
    ON conversation_participants (user_id);


-- =========================================================
-- 3. messages
-- =========================================================

CREATE TABLE messages (
    message_id BIGSERIAL PRIMARY KEY,

    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,

    content TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations (conversation_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id)
        REFERENCES users (user_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_messages_conversation_id_created_at
    ON messages (conversation_id, created_at DESC);

CREATE INDEX idx_messages_sender_id
    ON messages (sender_id);
`;

pool.query(sql)
  .then(() => {
    console.log("Existing tables dropped and chat schema successfully created!");
  })
  .catch((err) => {
    console.error("Error creating chat schema:", err);
  })
  .finally(() => {
    pool.end();
  });
