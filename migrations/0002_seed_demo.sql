INSERT OR IGNORE INTO artworks (
  id, slug, title, subtitle, year, medium, surface, width_cm, height_cm, description,
  price_cents, currency, status, is_featured, is_published, manual_sort_order,
  created_at, updated_at, published_at, reserved_until, revolut_payment_url
) VALUES
(
  'demo-ink-current', 'demo-marker-study-current', 'DEMO: Marker Study Current',
  'Sample listing for layout testing', 2026, 'Marker', 'Paper', 29.7, 42,
  'Demonstration data only. Replace this placeholder with a real artwork before launch.',
  18000, 'EUR', 'available', 1, 1, 10,
  '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', NULL, NULL
),
(
  'demo-night-lines', 'demo-night-lines', 'DEMO: Night Lines',
  'Reserved sample listing', 2025, 'Marker and spray paint', 'Board', 50, 70,
  'Demonstration data only. Use this entry to test reserved-state presentation.',
  26000, 'EUR', 'reserved', 0, 1, 20,
  '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2099-01-01T00:00:00.000Z',
  'https://revolut.me/example-placeholder'
),
(
  'demo-archive-piece', 'demo-archive-piece', 'DEMO: Archive Piece',
  'Sold sample listing', 2024, 'Marker', 'Paper', 21, 29.7,
  'Demonstration data only. Sold works remain visible as an archive.',
  12000, 'EUR', 'sold', 0, 1, 30,
  '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', NULL, NULL
);

INSERT OR IGNORE INTO artwork_images (
  id, artwork_id, object_key, alt_text, caption, width, height, file_type, file_size,
  display_order, is_primary, created_at
) VALUES
('demo-img-1', 'demo-ink-current', '/sample-art/demo-marker-study-current.svg', 'Neutral demo placeholder for a marker artwork listing.', 'Demo placeholder image.', 1200, 1500, 'image/svg+xml', 2048, 0, 1, '2026-08-04T00:00:00.000Z'),
('demo-img-2', 'demo-night-lines', '/sample-art/demo-night-lines.svg', 'Neutral demo placeholder for a reserved artwork listing.', 'Demo placeholder image.', 1200, 1400, 'image/svg+xml', 2048, 0, 1, '2026-08-04T00:00:00.000Z'),
('demo-img-3', 'demo-archive-piece', '/sample-art/demo-archive-piece.svg', 'Neutral demo placeholder for a sold artwork listing.', 'Demo placeholder image.', 1200, 1600, 'image/svg+xml', 2048, 0, 1, '2026-08-04T00:00:00.000Z');

INSERT OR IGNORE INTO site_settings (key, value, updated_at) VALUES
('siteDescription', 'Atelier Nivagion is an independent art practice based in Croatia, focused primarily on marker drawings and occasional spray-paint work.', '2026-08-04T00:00:00.000Z'),
('contactEmail', 'admin@example.com', '2026-08-04T00:00:00.000Z'),
('homepageIntroduction', 'Original marker drawings and occasional spray-paint works, presented directly from the studio.', '2026-08-04T00:00:00.000Z'),
('artistBiography', 'Editable placeholder: add the artist biography here when ready. Do not publish unreviewed personal history.', '2026-08-04T00:00:00.000Z'),
('studioLocationWording', 'Editable placeholder: describe the studio location in Croatia when ready.', '2026-08-04T00:00:00.000Z'),
('defaultShippingMessage', 'Shipping costs and timing are confirmed before payment unless a listed payment link is available.', '2026-08-04T00:00:00.000Z'),
('croatianShippingCents', '0', '2026-08-04T00:00:00.000Z'),
('internationalShippingMode', 'Editable placeholder: add international shipping availability and pricing.', '2026-08-04T00:00:00.000Z'),
('announcementText', '', '2026-08-04T00:00:00.000Z'),
('instagramUrl', '', '2026-08-04T00:00:00.000Z'),
('otherSocialUrl', '', '2026-08-04T00:00:00.000Z'),
('returnConditions', 'Editable legal placeholder: return conditions require review before launch.', '2026-08-04T00:00:00.000Z'),
('commissionAvailability', 'Editable placeholder: state whether commissions are currently available.', '2026-08-04T00:00:00.000Z'),
('customDomainEmail', 'Editable placeholder: replace with hello@nivagion.com when configured.', '2026-08-04T00:00:00.000Z'),
('legalSellerInformation', 'LEGAL REVIEW REQUIRED: add seller identity and required business details before launch.', '2026-08-04T00:00:00.000Z'),
('croatianBusinessTaxInformation', 'LEGAL/TAX REVIEW REQUIRED: add Croatian business and tax information before launch.', '2026-08-04T00:00:00.000Z');
