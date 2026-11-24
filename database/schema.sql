CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY, content TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY NOT NULL, content TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY NOT NULL, reference TEXT NOT NULL UNIQUE,
  access_hash TEXT NOT NULL, email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'awaiting_payment', content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_email ON registrations(email);
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL,
  is_private INTEGER NOT NULL DEFAULT 1 CHECK(is_private IN (0,1)), registration_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS file_chunks (
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY(file_id,chunk_index)
);
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY NOT NULL, hits INTEGER NOT NULL, expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY NOT NULL, admin_id TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER IF NOT EXISTS registrations_updated AFTER UPDATE OF content,status ON registrations
BEGIN
  UPDATE registrations SET updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS settings_updated AFTER UPDATE OF content ON settings
BEGIN
  UPDATE settings SET updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS files_deleted AFTER DELETE ON files
BEGIN
  DELETE FROM file_chunks WHERE file_id=OLD.id;
END;

CREATE TABLE IF NOT EXISTS staff_accounts(id TEXT PRIMARY KEY NOT NULL,role TEXT NOT NULL UNIQUE CHECK(role IN ('admin','finance')),code_hash TEXT NOT NULL);
