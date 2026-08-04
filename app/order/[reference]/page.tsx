import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { getOrderByReference } from "../../../lib/db/orders";
import { getSiteSettings } from "../../../lib/db/settings";
import { formatMoney } from "../../../lib/format";
import { canonical } from "../../../lib/site";

type Props = {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ payment?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Order ${reference}`,
    alternates: { canonical: canonical(`/order/${reference}`) },
  };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ reference }, { payment }, settings] = await Promise.all([params, searchParams, getSiteSettings()]);
  const order = await getOrderByReference(reference);
  if (!order) notFound();
  const shouldRedirect = payment === "redirect" && order.revolut_payment_url_used;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="editorial-title text-5xl">Request received</h1>
        <p className="mt-5 leading-8 text-[#746f67]">
          Your reference is <strong className="text-[#181614]">{order.public_reference}</strong>. Keep it for follow-up.
        </p>
        <dl className="mt-8 grid gap-4 border-y border-[#d7d0c5] py-6 text-sm">
          <Row label="Artwork" value={order.artwork_title ?? order.artwork_id} />
          <Row label="Total" value={formatMoney(order.total_price_cents, order.currency)} />
          <Row label="Payment" value={order.payment_status} />
          <Row label="Fulfilment" value={order.fulfilment_status} />
        </dl>
        {shouldRedirect ? (
          <div className="mt-8 border border-[#d7d0c5] p-6">
            <h2 className="editorial-title text-2xl">Payment link ready</h2>
            <p className="mt-3 text-[#746f67]">
              Payment confirmation may be processed manually. After paying, the artist can mark the order paid and the artwork sold.
            </p>
            <a className="button mt-5" href={order.revolut_payment_url_used ?? "#"} rel="noreferrer">
              Continue to Revolut
            </a>
          </div>
        ) : (
          <p className="mt-8 text-[#746f67]">
            Payment is not complete. The studio will send payment instructions separately to {order.email}.
          </p>
        )}
        <Link href="/works" className="button button-secondary mt-8">
          Back to works
        </Link>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4">
      <dt className="uppercase tracking-[0.08em] text-[#746f67]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
