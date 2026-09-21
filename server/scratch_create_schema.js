require('dotenv').config();
const { pool } = require('./config/db');

async function createSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const ddl = `
      CREATE TABLE IF NOT EXISTS conversations (
          conversation_id BIGSERIAL PRIMARY KEY,
          created_by BIGINT NOT NULL,
          property_id BIGINT NULL,
          inspection_id BIGINT NULL,
          visit_id BIGINT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_conv_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
          CONSTRAINT fk_conv_property FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
          CONSTRAINT fk_conv_inspection FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE SET NULL,
          CONSTRAINT fk_conv_visit FOREIGN KEY (visit_id) REFERENCES property_visits(visit_id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS conversation_participants (
          conversation_participant_id BIGSERIAL PRIMARY KEY,
          conversation_id BIGINT NOT NULL,
          user_id BIGINT NOT NULL,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_cp_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
          CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          CONSTRAINT uq_cp_conversation_user UNIQUE (conversation_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
          message_id BIGSERIAL PRIMARY KEY,
          conversation_id BIGINT NOT NULL,
          sender_id BIGINT NOT NULL,
          message_body TEXT NOT NULL,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP WITH TIME ZONE NULL,
          CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
          CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_cp_user_id ON conversation_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_cp_conversation_id ON conversation_participants(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_msg_conversation_sent_at ON messages(conversation_id, sent_at DESC);
      CREATE INDEX IF NOT EXISTS idx_msg_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_conv_property_id ON conversations(property_id);
      CREATE INDEX IF NOT EXISTS idx_conv_inspection_id ON conversations(inspection_id);
      CREATE INDEX IF NOT EXISTS idx_conv_visit_id ON conversations(visit_id);
    `;

    await client.query(ddl);
    await client.query('COMMIT');
    console.log("Schema created successfully");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating schema:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

createSchema();
