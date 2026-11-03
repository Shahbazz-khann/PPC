-- Migration: 003_create_customer_messages_table.sql
-- Description: Create customer_messages table for customer & admin inbox/outbox communications

CREATE TABLE IF NOT EXISTS customer_messages (
    message_id SERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbox', 'outbox')),
    sender_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    admin_read BOOLEAN NOT NULL DEFAULT false,
    admin_read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    reply_to_message_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance indices for fast queries and folder filtering
CREATE INDEX IF NOT EXISTS idx_customer_messages_customer_id ON customer_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_direction ON customer_messages(direction);
CREATE INDEX IF NOT EXISTS idx_customer_messages_is_read ON customer_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_customer_messages_admin_read ON customer_messages(admin_read);
CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON customer_messages(created_at DESC);
