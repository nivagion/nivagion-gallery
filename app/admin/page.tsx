import Link from "next/link";
import { Pencil } from "lucide-react";
import { getDashboardStats } from "../../lib/db/dashboard";
import { listAdminArtworks } from "../../lib/db/artworks";
import { formatArtworkStatus } from "../../lib/artwork-status";
import { listMessages } from "../../lib/db/messages";
import { formatDateTime } from "../../lib/format";

export default async function AdminDashboardPage() {
  const [stats, messages, artworks] = await Promise.all([getDashboardStats(), listMessages(), listAdminArtworks()]);
  const cards = [
    ["Published works", stats.published],
    ["Available works", stats.available],
    ["Reserved works", stats.reserved],
    ["Sold works", stats.sold],
    ["Not available", stats.notAvailable],
    ["Draft works", stats.draft],
    ["Pending requests", stats.pendingRequests],
    ["Paid awaiting shipment", stats.paidAwaitingShipment],
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="editorial-title text-4xl">Dashboard</h1>
          <p className="mt-2 text-[#084A24]">Overview of artworks, orders and messages.</p>
        </div>
        <Link href="/admin/artworks/new" className="button">
          Add artwork
        </Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-[#084A24]/25 bg-[#F2EDD5] p-5">
            <p className="text-sm uppercase tracking-[0.08em] text-[#084A24]">{label}</p>
            <p className="editorial-title mt-4 text-4xl">{value}</p>
          </div>
        ))}
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="editorial-title text-2xl">Quick Edit Artworks</h2>
          <Link href="/admin/artworks" className="text-sm underline underline-offset-4">
            Manage all
          </Link>
        </div>
        <div className="mb-8 grid gap-3">
          {artworks.slice(0, 5).map((artwork) => (
            <Link key={artwork.id} href={`/admin/artworks/${artwork.id}`} className="flex items-center justify-between border border-[#084A24]/25 bg-[#F2EDD5] p-4 hover:border-[#E7390D]">
              <span>
                <span className="font-semibold">{artwork.title}</span>
                <span className="ml-3 text-sm text-[#084A24]">{formatArtworkStatus(artwork.status)}</span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm">
                <Pencil size={16} aria-hidden />
                Edit details
              </span>
            </Link>
          ))}
          {!artworks.length ? <p className="border border-[#084A24]/25 p-6 text-[#084A24]">No artworks yet.</p> : null}
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="editorial-title text-2xl">Recent Messages</h2>
          <Link href="/admin/messages" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {messages.slice(0, 5).map((message) => (
            <div key={message.id} className="border border-[#084A24]/25 bg-[#F2EDD5] p-4">
              <p className="font-semibold">{message.subject}</p>
              <p className="mt-1 text-sm text-[#084A24]">
                {message.name} · {formatDateTime(message.created_at)}
              </p>
            </div>
          ))}
          {!messages.length ? <p className="border border-[#084A24]/25 p-6 text-[#084A24]">No messages yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
