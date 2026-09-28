import type { SiteSettings } from "./types";

export const siteConfig = {
  name: "Atelier Nivagion",
  shortName: "Nivagion",
  domain: "https://nivagion.com",
  artistLocation: "Croatia",
  primaryMedia: "marker drawings and spray-paint",
  currentContactEmail: "artist@example.com",
  defaultCurrency: "EUR",
  defaultLocale: "hr-HR",
  description: "Izrađujem razne crteže markerima i spray-paint radove.",
};

export const defaultSiteSettings: SiteSettings = {
  siteDescription: siteConfig.description,
  siteDescriptionHr: "Izrađujem razne crteže markerima i spray-paint radove.",
  contactEmail: siteConfig.currentContactEmail,
  homepageIntroduction: "Marker drawings and spray-paint. Originals only.",
  homepageIntroductionHr: "Crteži markerima i spray-paint radovi. Samo originali.",
  artistBiography: "",
  artistBiographyHr: "",
  studioLocationWording: "Croatia",
  defaultShippingMessage: "If a work interests you, send me a message and we can talk about it.",
  defaultShippingMessageHr: "Ako te zanima neki rad, pošalji mi poruku pa možemo razgovarati.",
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
