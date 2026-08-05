import Link from "next/link";
import { getLocale, t } from "../../lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteHeader() {
  const locale = await getLocale();
  const c = t(locale);
  const links = [
    { href: "/", label: c.nav.home },
    { href: "/works", label: c.nav.works },
    { href: "/contact", label: c.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#084A24]/25 bg-[#F2EDD5]/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <span className="editorial-title text-lg font-bold sm:text-xl">Atelier Nivagion</span>
        <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.08em] text-[#04261E] sm:gap-7">
          <div className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm px-3 py-2 transition-colors hover:bg-[#04261E]/10"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <LanguageSwitcher locale={locale} />
        </div>
      </nav>
    </header>
  );
}
