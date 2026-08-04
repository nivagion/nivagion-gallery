import Link from "next/link";
import { Image, Inbox, LayoutDashboard, Settings, ShoppingBag } from "lucide-react";
import { siteConfig } from "../../lib/site";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/artworks", label: "Artworks", icon: Image },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ email, mode }: { email: string; mode: "development" | "cloudflare-access" }) {
  return (
    <header className="border-b border-[#d7d0c5] bg-[#f4f0e8]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="editorial-title text-xl font-bold">
          {siteConfig.shortName} Admin
        </Link>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 border border-[#d7d0c5] px-3 py-2 text-sm hover:border-[#181614]" title={link.label}>
                <Icon size={16} aria-hidden />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <p className="text-xs text-[#746f67]">{mode === "development" ? "Local bypass" : email}</p>
      </div>
    </header>
  );
}
