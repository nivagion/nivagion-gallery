import { cookies } from "next/headers";
import type { SiteSettings } from "./types";
import { copy, t, type Locale } from "./i18n-copy";

export { copy, t, type Locale };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("nivagion_locale")?.value === "en" ? "en" : "hr";
}

export function localizedSettings(settings: SiteSettings, locale: Locale): SiteSettings {
  if (locale === "en") {
    return {
      ...settings,
      artistBiography: hasCommercialLanguage(settings.artistBiography)
        ? copy.en.home.artistIntro
        : settings.artistBiography,
      defaultShippingMessage: "If a work interests you, send me a message and we can talk about it.",
    };
  }
  return {
    ...settings,
    siteDescription: settings.siteDescriptionHr || copy.hr.home.description,
    homepageIntroduction: settings.homepageIntroductionHr || copy.hr.home.intro,
    artistBiography:
      !settings.artistBiographyHr || hasCommercialLanguage(settings.artistBiographyHr)
        ? copy.hr.home.artistIntro
        : settings.artistBiographyHr,
    studioLocationWording: "Hrvatska",
    defaultShippingMessage: "Ako te zanima neki rad, pošalji mi poruku pa možemo razgovarati.",
    internationalShippingMode: "",
    returnConditions: "",
    commissionAvailability: settings.commissionAvailabilityHr || copy.hr.about.customRequests,
  };
}

function hasCommercialLanguage(value: string) {
  const normalized = value.toLocaleLowerCase("hr-HR");
  return ["sell", "sale", "prodaj", "kupnj", "cijen", "shipping", "slanj", "pošt", "payment", "plać", "revolut"].some(
    (term) => normalized.includes(term)
  );
}
