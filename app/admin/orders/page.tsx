import Link from "next/link";
import { PackageCheck, RotateCcw, Search } from "lucide-react";
import { saveOrder, setSoldFromOrder } from "../actions";
import { listOrders } from "../../../lib/db/orders";
import { formatDateTime, formatMoney } from "../../../lib/format";
import { fulfilmentStatuses, paymentStatuses } from "../../../lib/validation/forms";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const orders = await listOrders(q);
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="editorial-title text-4xl">Orders</h1>
        <p className="mt-2 text-[#746f67]">Search purchase requests, payment state and fulfilment.</p>
      </div>
      <form className="flex max-w-xl gap-2">
        <input className="field" name="q" defaultValue={q} placeholder="Reference, customer, email or artwork" />
        <button className="button" title="Search orders">
          <Search size={18} aria-hidden />
          Search
        </button>
      </form>
      <div className="grid gap-5">
        {orders.map((order) => (
          <article key={order.id} className="border border-[#d7d0c5] bg-[#f8f4ed] p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div>
                <h2 className="editorial-title text-2xl">{order.public_reference}</h2>
                <p className="mt-2 text-sm text-[#746f67]">
                  {order.customer_full_name} · {order.email} · {formatDateTime(order.created_at)}
                </p>
                <p className="mt-4">{order.artwork_title}</p>
                {order.artwork_slug ? (
                  <Link className="text-sm underline underline-offset-4" href={`/works/${order.artwork_slug}`}>
                    View artwork
                  </Link>
                ) : null}
                <dl className="mt-4 grid gap-2 text-sm">
                  <Row label="Phone" value={order.telephone} />
                  <Row label="Address" value={`${order.street_address}, ${order.postal_code} ${order.city}, ${order.country}`} />
                  <Row label="Total" value={formatMoney(order.total_price_cents, order.currency)} />
                  <Row label="Payment link" value={order.revolut_payment_url_used ?? "Manual request"} />
                </dl>
              </div>
              <form action={saveOrder} className="grid gap-4">
                <input type="hidden" name="orderId" value={order.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="label">
                    Payment
                    <select className="field" name="paymentStatus" defaultValue={order.payment_status}>
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="label">
                    Fulfilment
                    <select className="field" name="fulfilmentStatus" defaultValue={order.fulfilment_status}>
                      {fulfilmentStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="label">
                  Internal notes
                  <textarea className="field min-h-24" name="internalNotes" defaultValue={order.internal_notes ?? ""} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className="button">
                    <PackageCheck size={18} aria-hidden />
                    Save status
                  </button>
                </div>
              </form>
              <form action={setSoldFromOrder}>
                <input type="hidden" name="artworkId" value={order.artwork_id} />
                <button className="button button-secondary" title="Mark related artwork sold">
                  <RotateCcw size={18} aria-hidden />
                  Mark artwork sold
                </button>
              </form>
            </div>
          </article>
        ))}
        {!orders.length ? <p className="border border-[#d7d0c5] p-6 text-[#746f67]">No orders found.</p> : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3">
      <dt className="text-[#746f67]">{label}</dt>
      <dd className="break-words">{value}</dd>
    </div>
  );
}
