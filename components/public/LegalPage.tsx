import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { getSiteSettings } from "../../lib/db/settings";
import { getLocale, localizedSettings } from "../../lib/i18n";

export async function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const settings = localizedSettings(await getSiteSettings(), locale);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="editorial-title text-5xl">{title}</h1>
        <div className="mt-8 grid gap-5 leading-8 text-[#04261E]">{children}</div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
