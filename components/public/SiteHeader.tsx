import Link from "next/link";
import { siteConfig } from "../../lib/site";

const links = [
  { href: "/works", label: "Works" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d7d0c5] bg-[#f4f0e8]/92 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="editorial-title text-lg font-bold sm:text-xl">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-4 text-sm uppercase tracking-[0.08em] text-[#4b4741] sm:gap-7">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#181614]">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
