require('dotenv').config();
const { pool } = require('./config/db');

async function run() {
  try {
    console.log("1. Verifying existing columns...");
    const cols = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE (table_name = 'users' AND column_name = 'user_id')
         OR (table_name = 'properties' AND column_name = 'property_id')
         OR (table_name = 'inspections' AND column_name = 'inspection_id')
         OR (table_name = 'property_visits' AND column_name = 'visit_id');
    `);
    console.log(JSON.stringify(cols.rows, null, 2));

    console.log("\n2. Executing Schema...");
    const schemaSql = `
    DROP TABLE IF EXISTS messages CASCADE;
    DROP TABLE IF EXISTS conversation_participants CASCADE;
    DROP TABLE IF EXISTS conversations CASCADE;

    CREATE TABLE conversations (
        conversation_id BIGSERIAL PRIMARY KEY,
        created_by BIGINT NOT NULL,
        property_id BIGINT NULL,
        inspection_id BIGINT NULL,
        visit_id BIGINT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_conversations_created_by FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE RESTRICT,
        CONSTRAINT fk_conversations_property FOREIGN KEY (property_id) REFERENCES properties (property_id) ON DELETE SET NULL,
        CONSTRAINT fk_conversations_inspection FOREIGN KEY (inspection_id) REFERENCES inspections (inspection_id) ON DELETE SET NULL,
        CONSTRAINT fk_conversations_visit FOREIGN KEY (visit_id) REFERENCES property_visits (visit_id) ON DELETE SET NULL
    );

    CREATE INDEX idx_conversations_property_id ON conversations (property_id);
    CREATE INDEX idx_conversations_inspection_id ON conversations (inspection_id);
    CREATE INDEX idx_conversations_visit_id ON conversations (visit_id);
    CREATE INDEX idx_conversations_created_by ON conversations (created_by);

    CREATE TABLE conversation_participants (
        conversation_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (conversation_id, user_id),
        CONSTRAINT fk_participants_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (conversation_id) ON DELETE CASCADE,
        CONSTRAINT fk_participants_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE RESTRICT
    );

    CREATE INDEX idx_conversation_participants_user_id ON conversation_participants (user_id);

    CREATE TABLE messages (
        message_id BIGSERIAL PRIMARY KEY,
        conversation_id BIGINT NOT NULL,
        sender_id BIGINT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (conversation_id) ON DELETE CASCADE,
        CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (user_id) ON DELETE RESTRICT
    );

    CREATE INDEX idx_messages_conversation_id_created_at ON messages (conversation_id, created_at DESC);
    CREATE INDEX idx_messages_sender_id ON messages (sender_id);
    `;
    await pool.query(schemaSql);
    console.log("Schema executed successfully.");

    console.log("\n3. Verifying Columns and Data Types...");
    const columns = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name IN ('conversations', 'conversation_participants', 'messages')
      ORDER BY table_name, ordinal_position;
    `);
    console.log(JSON.stringify(columns.rows, null, 2));

    console.log("\n4. Verifying Foreign Keys...");
    const fks = await pool.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.update_rule AS on_update,
          rc.delete_rule AS on_delete
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('conversations', 'conversation_participants', 'messages');
    `);
    console.log(JSON.stringify(fks.rows, null, 2));

    console.log("\n5. Verifying Indexes...");
    const indexes = await pool.query(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
      ORDER BY tablename, indexname;
    `);
    console.log(JSON.stringify(indexes.rows, null, 2));

  } catch (error) {
    console.error("Execution failed:", error);
  } finally {
    pool.end();
  }
}

run();
