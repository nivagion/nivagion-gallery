import { cookies } from "next/headers";
import type { SiteSettings } from "./types";
import { copy, t, type Locale } from "./i18n-copy";

export { copy, t, type Locale };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("nivagion_locale")?.value === "hr" ? "hr" : "en";
}

export function localizedSettings(settings: SiteSettings, locale: Locale): SiteSettings {
  if (locale === "en") return settings;
  return {
    ...settings,
    siteDescription: settings.siteDescriptionHr || copy.hr.home.description,
    homepageIntroduction: settings.homepageIntroductionHr || copy.hr.home.intro,
    artistBiography: settings.artistBiographyHr || copy.hr.home.artistIntro,
    studioLocationWording: "Hrvatska",
    defaultShippingMessage: settings.defaultShippingMessageHr || "Za slanje planiram koristiti Hrvatsku Poštu. Pošalji mi poruku ako imaš pitanje.",
    internationalShippingMode: "",
    returnConditions: "",
    commissionAvailability: settings.commissionAvailabilityHr || copy.hr.about.customRequests,
  };
}
