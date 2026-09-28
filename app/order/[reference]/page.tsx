import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { getOrderByReference } from "../../../lib/db/orders";
import { getSiteSettings } from "../../../lib/db/settings";
import { getLocale, localizedSettings, t } from "../../../lib/i18n";
import { canonical } from "../../../lib/site";

type Props = {
  params: Promise<{ reference: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Message ${reference}`,
    alternates: { canonical: canonical(`/order/${reference}`) },
  };
}

export default async function OrderPage({ params }: Props) {
  const locale = await getLocale();
  const c = t(locale);
  const [{ reference }, rawSettings] = await Promise.all([params, getSiteSettings()]);
  const settings = localizedSettings(rawSettings, locale);
  const order = await getOrderByReference(reference);
  if (!order) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="editorial-title text-5xl">{c.order.received}</h1>
        <p className="mt-5 leading-8 text-[#084A24]">
          {c.order.reference} <strong className="text-[#04261E]">{order.public_reference}</strong>. {c.order.keepIt}
        </p>
        <dl className="mt-8 grid gap-4 border-y border-[#084A24]/25 py-6 text-sm">
          <Row label={c.order.artwork} value={order.artwork_title ?? order.artwork_id} />
        </dl>
        <p className="mt-8 text-[#084A24]">
          {c.order.manual} {order.email}.
        </p>
        <Link href="/works" className="button button-secondary mt-8">
          {c.common.backToWorks}
        </Link>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4">
      <dt className="uppercase tracking-[0.08em] text-[#084A24]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
