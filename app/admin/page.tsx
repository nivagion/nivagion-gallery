import Link from "next/link";
import { getDashboardStats } from "../../lib/db/dashboard";
import { listMessages } from "../../lib/db/messages";
import { formatDateTime } from "../../lib/format";

export default async function AdminDashboardPage() {
  const [stats, messages] = await Promise.all([getDashboardStats(), listMessages()]);
  const cards = [
    ["Published works", stats.published],
    ["Available works", stats.available],
    ["Reserved works", stats.reserved],
    ["Sold works", stats.sold],
    ["Draft works", stats.draft],
    ["Pending requests", stats.pendingRequests],
    ["Paid awaiting shipment", stats.paidAwaitingShipment],
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="editorial-title text-4xl">Dashboard</h1>
          <p className="mt-2 text-[#746f67]">Overview of artworks, orders and messages.</p>
        </div>
        <Link href="/admin/artworks/new" className="button">
          Add artwork
        </Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-[#d7d0c5] bg-[#f8f4ed] p-5">
            <p className="text-sm uppercase tracking-[0.08em] text-[#746f67]">{label}</p>
            <p className="editorial-title mt-4 text-4xl">{value}</p>
          </div>
        ))}
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="editorial-title text-2xl">Recent Messages</h2>
          <Link href="/admin/messages" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {messages.slice(0, 5).map((message) => (
            <div key={message.id} className="border border-[#d7d0c5] bg-[#f8f4ed] p-4">
              <p className="font-semibold">{message.subject}</p>
              <p className="mt-1 text-sm text-[#746f67]">
                {message.name} · {formatDateTime(message.created_at)}
              </p>
            </div>
          ))}
          {!messages.length ? <p className="border border-[#d7d0c5] p-6 text-[#746f67]">No messages yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
