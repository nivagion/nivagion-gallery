import Link from "next/link";
import { siteConfig } from "../../lib/site";
import type { SiteSettings } from "../../lib/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-[#d7d0c5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="editorial-title text-2xl">{siteConfig.name}</p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#746f67]">{settings.siteDescription}</p>
          <a className="mt-4 inline-block text-sm underline underline-offset-4" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
        </div>
        <div className="grid gap-3 text-sm text-[#4b4741] sm:grid-cols-2 sm:gap-x-8">
          <Link href="/shipping-and-returns">Shipping and returns</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <span>Instagram placeholder</span>
          <span>Other social placeholder</span>
        </div>
      </div>
    </footer>
  );
}
