ALTER TABLE contact_messages ADD COLUMN is_starred INTEGER NOT NULL DEFAULT 0 CHECK (is_starred IN (0, 1));
ALTER TABLE contact_messages ADD COLUMN is_trashed INTEGER NOT NULL DEFAULT 0 CHECK (is_trashed IN (0, 1));

CREATE INDEX IF NOT EXISTS idx_messages_admin_state ON contact_messages(is_trashed, is_starred, created_at);
