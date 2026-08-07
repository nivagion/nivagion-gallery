import { unstable_noStore as noStore } from "next/cache";
import { getDb } from "./client";
import { demoArtworks } from "./seed-data";

export type DashboardStats = {
  published: number;
  available: number;
  reserved: number;
  sold: number;
  notAvailable: number;
  draft: number;
  pendingRequests: number;
  paidAwaitingShipment: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  noStore();
  const db = getDb();
  if (!db) {
    return {
      published: demoArtworks.filter((item) => item.is_published).length,
      available: demoArtworks.filter((item) => item.status === "available").length,
      reserved: demoArtworks.filter((item) => item.status === "reserved").length,
      sold: demoArtworks.filter((item) => item.status === "sold").length,
      notAvailable: demoArtworks.filter((item) => item.status === "not_available").length,
      draft: demoArtworks.filter((item) => item.status === "draft").length,
      pendingRequests: 0,
      paidAwaitingShipment: 0,
    };
  }
  const row = await db
    .prepare(
      `SELECT
       SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
       SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
       SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
       SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
       SUM(CASE WHEN status = 'not_available' THEN 1 ELSE 0 END) as notAvailable,
       SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
       FROM artworks`
    )
    .first<DashboardStats>();
  const orderRow = await db
    .prepare(
      `SELECT
       SUM(CASE WHEN payment_status IN ('request', 'pending') THEN 1 ELSE 0 END) as pendingRequests,
       SUM(CASE WHEN payment_status = 'paid' AND fulfilment_status = 'unfulfilled' THEN 1 ELSE 0 END) as paidAwaitingShipment
       FROM orders`
    )
    .first<Pick<DashboardStats, "pendingRequests" | "paidAwaitingShipment">>();
  return {
    published: Number(row?.published ?? 0),
    available: Number(row?.available ?? 0),
    reserved: Number(row?.reserved ?? 0),
    sold: Number(row?.sold ?? 0),
    notAvailable: Number(row?.notAvailable ?? 0),
    draft: Number(row?.draft ?? 0),
    pendingRequests: Number(orderRow?.pendingRequests ?? 0),
    paidAwaitingShipment: Number(orderRow?.paidAwaitingShipment ?? 0),
  };
}
