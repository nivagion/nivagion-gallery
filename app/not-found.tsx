import Link from "next/link";
import { SiteHeader } from "../components/public/SiteHeader";
import { getLocale, t } from "../lib/i18n";

export default async function NotFound() {
  const c = t(await getLocale());
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[70vh] max-w-3xl content-center px-4 py-20 text-center">
        <h1 className="editorial-title text-5xl">{c.notFound.title}</h1>
        <p className="mt-4 text-[#084A24]">{c.notFound.text}</p>
        <Link href="/works" className="button mx-auto mt-8">
          {c.common.browseWorks}
        </Link>
      </main>
    </>
  );
}
