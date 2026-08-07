PRAGMA foreign_keys = OFF;

CREATE TABLE artworks_next (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  year INTEGER,
  medium TEXT NOT NULL,
  surface TEXT,
  width_cm REAL,
  height_cm REAL,
  description TEXT,
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN ('draft', 'available', 'reserved', 'sold', 'not_available', 'archived')),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  manual_sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  published_at TEXT,
  reserved_until TEXT,
  revolut_payment_url TEXT
);

INSERT INTO artworks_next (
  id, slug, title, subtitle, year, medium, surface, width_cm, height_cm, description,
  price_cents, currency, status, is_featured, is_published, manual_sort_order,
  created_at, updated_at, published_at, reserved_until, revolut_payment_url
)
SELECT
  id, slug, title, subtitle, year, medium, surface, width_cm, height_cm, description,
  price_cents, currency, status, is_featured, is_published, manual_sort_order,
  created_at, updated_at, published_at, reserved_until, revolut_payment_url
FROM artworks;

DROP TABLE artworks;
ALTER TABLE artworks_next RENAME TO artworks;

CREATE INDEX IF NOT EXISTS idx_artworks_public_order ON artworks(is_published, status, manual_sort_order);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(is_featured, is_published);

UPDATE artworks
SET status = 'not_available'
WHERE id = 'demo-sold-spray' AND title LIKE 'DEMO:%';

PRAGMA foreign_keys = ON;
