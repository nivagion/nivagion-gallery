INSERT OR IGNORE INTO artworks (
  id, slug, title, subtitle, year, medium, surface, width_cm, height_cm, description,
  price_cents, currency, status, is_featured, is_published, manual_sort_order,
  created_at, updated_at, published_at, reserved_until, revolut_payment_url
) VALUES
('demo-ink-current', 'demo-marker-study-current', 'DEMO: Marker Study Current', 'Sample listing for layout testing', 2026, 'Marker', 'Paper', 29.7, 42, 'Demo artwork entry for testing the gallery. Replace before launch.', 18000, 'EUR', 'available', 1, 1, 10, '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', NULL, NULL),
('demo-night-lines', 'demo-night-lines', 'DEMO: Night Lines', 'Reserved sample listing', 2025, 'Marker drawings and spray-paint', 'Board', 50, 70, 'Demo artwork entry for testing reserved display.', 26000, 'EUR', 'reserved', 0, 1, 20, '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2099-01-01T00:00:00.000Z', NULL),
('demo-archive-piece', 'demo-archive-piece', 'DEMO: Archive Piece', 'Sold sample listing', 2024, 'Marker', 'Paper', 21, 29.7, 'Demo sold artwork entry for testing the gallery.', 12000, 'EUR', 'sold', 0, 1, 30, '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z', NULL, NULL),
('demo-red-angle', 'demo-red-angle', 'DEMO: Red Angle', NULL, 2026, 'Marker drawings and spray-paint', 'Paper', 30, 40, 'Demo artwork entry for testing the gallery. Replace before launch.', 21000, 'EUR', 'available', 1, 1, 40, '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', NULL, NULL),
('demo-green-room', 'demo-green-room', 'DEMO: Green Room', NULL, 2026, 'Marker', 'Paper', 24, 32, 'Demo artwork entry for testing the gallery. Replace before launch.', 15000, 'EUR', 'available', 0, 1, 50, '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', NULL, NULL),
('demo-orange-signal', 'demo-orange-signal', 'DEMO: Orange Signal', NULL, 2025, 'Marker drawings and spray-paint', 'Board', 42, 59, 'Demo artwork entry for testing the gallery. Replace before launch.', 24000, 'EUR', 'available', 0, 1, 60, '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', NULL, NULL),
('demo-small-mark', 'demo-small-mark', 'DEMO: Small Mark', NULL, 2025, 'Marker', 'Paper', 18, 24, 'Demo artwork entry for testing the gallery. Replace before launch.', 9000, 'EUR', 'available', 0, 1, 70, '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', NULL, NULL),
('demo-sold-line', 'demo-sold-line', 'DEMO: Sold Line', NULL, 2024, 'Marker', 'Paper', 21, 30, 'Demo sold artwork entry for testing the gallery.', 11000, 'EUR', 'sold', 0, 1, 80, '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', NULL, NULL),
('demo-sold-spray', 'demo-sold-spray', 'DEMO: Sold Spray', NULL, 2024, 'Marker drawings and spray-paint', 'Board', 50, 70, 'Demo sold artwork entry for testing the gallery.', 27000, 'EUR', 'not_available', 0, 1, 90, '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', '2026-08-05T00:00:00.000Z', NULL, NULL);

INSERT OR IGNORE INTO artwork_images (
  id, artwork_id, object_key, alt_text, caption, width, height, file_type, file_size,
  display_order, is_primary, created_at
) VALUES
('demo-img-1', 'demo-ink-current', '/sample-art/demo-marker-study-current.svg', 'Demo image for a marker drawing listing.', 'Demo image.', 1200, 1500, 'image/svg+xml', 2048, 0, 1, '2026-08-04T00:00:00.000Z'),
('demo-img-2', 'demo-night-lines', '/sample-art/demo-night-lines.svg', 'Demo image for a reserved artwork listing.', 'Demo image.', 1200, 1400, 'image/svg+xml', 2048, 0, 1, '2026-08-04T00:00:00.000Z'),
('demo-img-3', 'demo-archive-piece', '/sample-art/demo-archive-piece.svg', 'Demo image for a sold artwork listing.', 'Demo image.', 1200, 1600, 'image/svg+xml', 2048, 0, 1, '2026-08-04T00:00:00.000Z'),
('demo-img-4', 'demo-red-angle', '/sample-art/demo-marker-study-current.svg', 'Demo image for an available artwork listing.', 'Demo image.', 1200, 1500, 'image/svg+xml', 2048, 0, 1, '2026-08-05T00:00:00.000Z'),
('demo-img-5', 'demo-green-room', '/sample-art/demo-night-lines.svg', 'Demo image for an available artwork listing.', 'Demo image.', 1200, 1400, 'image/svg+xml', 2048, 0, 1, '2026-08-05T00:00:00.000Z'),
('demo-img-6', 'demo-orange-signal', '/sample-art/demo-archive-piece.svg', 'Demo image for an available artwork listing.', 'Demo image.', 1200, 1600, 'image/svg+xml', 2048, 0, 1, '2026-08-05T00:00:00.000Z'),
('demo-img-7', 'demo-small-mark', '/sample-art/demo-marker-study-current.svg', 'Demo image for an available artwork listing.', 'Demo image.', 1200, 1500, 'image/svg+xml', 2048, 0, 1, '2026-08-05T00:00:00.000Z'),
('demo-img-8', 'demo-sold-line', '/sample-art/demo-archive-piece.svg', 'Demo image for a sold artwork listing.', 'Demo image.', 1200, 1600, 'image/svg+xml', 2048, 0, 1, '2026-08-05T00:00:00.000Z'),
('demo-img-9', 'demo-sold-spray', '/sample-art/demo-night-lines.svg', 'Demo image for a sold artwork listing.', 'Demo image.', 1200, 1400, 'image/svg+xml', 2048, 0, 1, '2026-08-05T00:00:00.000Z');

INSERT OR IGNORE INTO site_settings (key, value, updated_at) VALUES
('siteDescription', 'I make various marker drawings and spray paintings.', '2026-08-04T00:00:00.000Z'),
('siteDescriptionHr', 'Izrađujem razne crteže markerima i spray-paint radove.', '2026-08-04T00:00:00.000Z'),
('contactEmail', 'artist@example.com', '2026-08-04T00:00:00.000Z'),
('homepageIntroduction', 'Marker drawings and spray-paint. Originals only.', '2026-08-04T00:00:00.000Z'),
('homepageIntroductionHr', 'Crteži markerima i spray-paint radovi. Samo originali.', '2026-08-04T00:00:00.000Z'),
('artistBiography', 'I''m Leo. I draw for fun and sell the pieces I want to let go.', '2026-08-04T00:00:00.000Z'),
('artistBiographyHr', 'Ja sam Leo. Crtam iz gušta i prodajem radove koje želim pustiti dalje.', '2026-08-04T00:00:00.000Z'),
('studioLocationWording', 'Croatia', '2026-08-04T00:00:00.000Z'),
('defaultShippingMessage', 'I plan to ship with Hrvatska Posta. Message me if you have questions.', '2026-08-04T00:00:00.000Z'),
('defaultShippingMessageHr', 'Za slanje planiram koristiti Hrvatsku Poštu. Pošalji mi poruku ako imaš pitanje.', '2026-08-04T00:00:00.000Z'),
('croatianShippingCents', '0', '2026-08-04T00:00:00.000Z'),
('internationalShippingMode', '', '2026-08-04T00:00:00.000Z'),
('announcementText', '', '2026-08-04T00:00:00.000Z'),
('instagramUrl', '', '2026-08-04T00:00:00.000Z'),
('otherSocialUrl', '', '2026-08-04T00:00:00.000Z'),
('returnConditions', '', '2026-08-04T00:00:00.000Z'),
('commissionAvailability', 'For custom ideas, send me a message.', '2026-08-04T00:00:00.000Z'),
('commissionAvailabilityHr', 'Za ideje po dogovoru, pošalji mi poruku.', '2026-08-04T00:00:00.000Z'),
('customDomainEmail', 'hello@nivagion.com can be added later.', '2026-08-04T00:00:00.000Z'),
('legalSellerInformation', 'Add seller details before launch.', '2026-08-04T00:00:00.000Z'),
('croatianBusinessTaxInformation', 'Add Croatian business and tax information before launch.', '2026-08-04T00:00:00.000Z');
