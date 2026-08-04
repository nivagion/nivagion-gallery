import { Save } from "lucide-react";
import { saveSettings } from "../actions";
import { getSiteSettings } from "../../../lib/db/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="editorial-title text-4xl">Settings</h1>
        <p className="mt-2 text-[#746f67]">Editable identity, contact, social, shipping and legal placeholders.</p>
      </div>
      <form action={saveSettings} className="grid gap-5">
        <label className="label">
          Site description
          <textarea className="field min-h-24" name="siteDescription" defaultValue={settings.siteDescription} />
        </label>
        <label className="label">
          Homepage introduction
          <textarea className="field min-h-24" name="homepageIntroduction" defaultValue={settings.homepageIntroduction} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">
            Contact email
            <input className="field" name="contactEmail" type="email" defaultValue={settings.contactEmail} />
          </label>
          <label className="label">
            Croatian shipping EUR
            <input className="field" name="croatianShippingEur" inputMode="decimal" defaultValue={settings.croatianShippingCents / 100} />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">
            Instagram URL
            <input className="field" name="instagramUrl" defaultValue={settings.instagramUrl} />
          </label>
          <label className="label">
            Other social URL
            <input className="field" name="otherSocialUrl" defaultValue={settings.otherSocialUrl} />
          </label>
        </div>
        {[
          ["artistBiography", "Artist biography"],
          ["studioLocationWording", "Studio location wording"],
          ["defaultShippingMessage", "Default shipping message"],
          ["internationalShippingMode", "International shipping mode"],
          ["announcementText", "Announcement text"],
          ["returnConditions", "Return conditions"],
          ["commissionAvailability", "Commission availability"],
          ["customDomainEmail", "Custom domain email"],
          ["legalSellerInformation", "Legal seller information"],
          ["croatianBusinessTaxInformation", "Croatian business and tax information"],
        ].map(([name, label]) => (
          <label key={name} className="label">
            {label}
            <textarea className="field min-h-24" name={name} defaultValue={String(settings[name as keyof typeof settings] ?? "")} />
          </label>
        ))}
        <button className="button justify-self-start">
          <Save size={18} aria-hidden />
          Save settings
        </button>
      </form>
    </div>
  );
}
