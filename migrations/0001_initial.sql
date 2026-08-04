PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS artworks (
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
  status TEXT NOT NULL CHECK (status IN ('draft', 'available', 'reserved', 'sold', 'archived')),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  manual_sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  published_at TEXT,
  reserved_until TEXT,
  revolut_payment_url TEXT
);

CREATE TABLE IF NOT EXISTS artwork_images (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  alt_text TEXT NOT NULL CHECK (length(alt_text) >= 3),
  caption TEXT,
  width INTEGER,
  height INTEGER,
  file_type TEXT NOT NULL CHECK (file_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml')),
  file_size INTEGER NOT NULL CHECK (file_size >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  public_reference TEXT NOT NULL UNIQUE,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE RESTRICT,
  customer_full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  delivery_note TEXT,
  artwork_price_cents INTEGER NOT NULL CHECK (artwork_price_cents >= 0),
  shipping_price_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_price_cents >= 0),
  total_price_cents INTEGER NOT NULL CHECK (total_price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('request', 'pending', 'paid', 'cancelled', 'refunded')),
  fulfilment_status TEXT NOT NULL CHECK (fulfilment_status IN ('unfulfilled', 'shipped', 'cancelled', 'refunded')),
  revolut_payment_url_used TEXT,
  internal_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  paid_at TEXT,
  shipped_at TEXT
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  artwork_reference TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS social_links (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS shipping_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_artworks_public_order ON artworks(is_published, status, manual_sort_order);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(is_featured, is_published);
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork ON artwork_images(artwork_id, display_order);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(public_reference);
CREATE INDEX IF NOT EXISTS idx_orders_artwork ON orders(artwork_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status, fulfilment_status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages(created_at);
