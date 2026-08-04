import type { SiteSettings } from "./types";

export const siteConfig = {
  name: "Atelier Nivagion",
  shortName: "Nivagion",
  domain: "https://nivagion.com",
  artistLocation: "Croatia",
  primaryMedia: "marker artwork, with occasional spray-paint work",
  currentContactEmail: "admin@example.com",
  defaultCurrency: "EUR",
  defaultLocale: "en-HR",
  description:
    "Atelier Nivagion is an independent art practice based in Croatia, focused primarily on marker drawings and occasional spray-paint work.",
};

export const defaultSiteSettings: SiteSettings = {
  siteDescription: siteConfig.description,
  contactEmail: siteConfig.currentContactEmail,
  homepageIntroduction:
    "Original marker drawings and occasional spray-paint works, presented directly from the studio.",
  artistBiography:
    "Editable placeholder: add the artist biography here when ready. Do not publish unreviewed personal history.",
  studioLocationWording:
    "Editable placeholder: describe the studio location in Croatia when ready.",
  defaultShippingMessage:
    "Shipping costs and timing are confirmed before payment unless a listed payment link is available.",
  croatianShippingCents: 0,
  internationalShippingMode:
    "Editable placeholder: add international shipping availability and pricing.",
  announcementText: "",
  instagramUrl: "",
  otherSocialUrl: "",
  returnConditions:
    "Editable legal placeholder: return conditions require review before launch.",
  commissionAvailability:
    "Editable placeholder: state whether commissions are currently available.",
  customDomainEmail: "Editable placeholder: replace with hello@nivagion.com when configured.",
  legalSellerInformation:
    "LEGAL REVIEW REQUIRED: add seller identity and required business details before launch.",
  croatianBusinessTaxInformation:
    "LEGAL/TAX REVIEW REQUIRED: add Croatian business and tax information before launch.",
};

export function canonical(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.domain}${cleanPath}`;
}
