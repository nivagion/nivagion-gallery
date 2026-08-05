import type { SiteSettings } from "./types";

export const siteConfig = {
  name: "Atelier Nivagion",
  shortName: "Nivagion",
  domain: "https://nivagion.com",
  artistLocation: "Croatia",
  primaryMedia: "marker drawings and spray-paint",
  currentContactEmail: "admin@example.com",
  defaultCurrency: "EUR",
  defaultLocale: "en-HR",
  description: "I make various marker drawings and spray paintings.",
};

export const defaultSiteSettings: SiteSettings = {
  siteDescription: siteConfig.description,
  siteDescriptionHr: "Izrađujem razne crteže markerima i spray-paint radove.",
  contactEmail: siteConfig.currentContactEmail,
  homepageIntroduction: "Marker drawings and spray-paint. Originals only.",
  homepageIntroductionHr: "Crteži markerima i spray-paint radovi. Samo originali.",
  artistBiography: "I'm Leo. I draw for fun and sell the pieces I want to let go.",
  artistBiographyHr:
    "Ja sam Leo. Crtam iz gušta i prodajem radove koje želim pustiti dalje.",
  studioLocationWording: "Croatia",
  defaultShippingMessage:
    "I plan to ship with Hrvatska Posta. Message me if you have questions.",
  defaultShippingMessageHr:
    "Za slanje planiram koristiti Hrvatsku Poštu. Pošalji mi poruku ako imaš pitanje.",
  croatianShippingCents: 0,
  internationalShippingMode: "",
  announcementText: "",
  instagramUrl: "",
  otherSocialUrl: "",
  returnConditions: "",
  commissionAvailability: "For custom ideas, send me a message.",
  commissionAvailabilityHr: "Za ideje po dogovoru, pošalji mi poruku.",
  customDomainEmail: "hello@nivagion.com can be added later.",
  legalSellerInformation: "Add seller details before launch.",
  croatianBusinessTaxInformation:
    "Add Croatian business and tax information before launch.",
};

export function canonical(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.domain}${cleanPath}`;
}
