UPDATE site_settings
SET value = 'I make various marker drawings and spray paintings.',
    updated_at = '2026-08-05T00:00:00.000Z'
WHERE key = 'siteDescription';

UPDATE site_settings
SET value = 'Marker drawings and spray-paint. Originals only.',
    updated_at = '2026-08-05T00:00:00.000Z'
WHERE key = 'homepageIntroduction';

UPDATE site_settings
SET value = 'I''m Leo. I draw for fun and sell the pieces I want to let go.',
    updated_at = '2026-08-05T00:00:00.000Z'
WHERE key = 'artistBiography';

UPDATE site_settings
SET value = 'I plan to ship with Hrvatska Posta. Message me if you have questions.',
    updated_at = '2026-08-05T00:00:00.000Z'
WHERE key = 'defaultShippingMessage';

UPDATE site_settings
SET value = 'For custom ideas, send me a message.',
    updated_at = '2026-08-05T00:00:00.000Z'
WHERE key = 'commissionAvailability';

INSERT INTO site_settings (key, value, updated_at) VALUES
('siteDescriptionHr', 'Izrađujem razne crteže markerima i spray-paint radove.', '2026-08-05T00:00:00.000Z'),
('homepageIntroductionHr', 'Crteži markerima i spray-paint radovi. Samo originali.', '2026-08-05T00:00:00.000Z'),
('artistBiographyHr', 'Ja sam Leo. Crtam iz gušta i prodajem radove koje želim pustiti dalje.', '2026-08-05T00:00:00.000Z'),
('defaultShippingMessageHr', 'Za slanje planiram koristiti Hrvatsku Poštu. Pošalji mi poruku ako imaš pitanje.', '2026-08-05T00:00:00.000Z'),
('commissionAvailabilityHr', 'Za ideje po dogovoru, pošalji mi poruku.', '2026-08-05T00:00:00.000Z')
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;
