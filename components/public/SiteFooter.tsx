import Link from "next/link";
import { siteConfig } from "../../lib/site";
import type { SiteSettings } from "../../lib/types";
import { getLocale, t } from "../../lib/i18n";

export async function SiteFooter({ settings }: { settings: SiteSettings }) {
  const locale = await getLocale();
  const c = t(locale);
  const tagline =
    locale === "hr"
      ? "crteži markerom i spray-painting"
      : "marker drawings and spray paintings";
  return (
    <footer className="border-t border-[#084A24]/25 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="editorial-title text-2xl">
            {siteConfig.name}
            <span className="font-sans text-sm font-normal text-[#084A24]"> · {tagline}</span>
          </p>
          <a className="mt-4 inline-block text-sm underline underline-offset-4" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
        </div>
        <div className="grid gap-3 text-sm text-[#04261E] sm:grid-cols-2 sm:gap-x-8">
          <Link href="/shipping-and-returns">{c.nav.shipping}</Link>
          <Link href="/privacy">{c.nav.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
