"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "../../lib/i18n-copy";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextPath = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

  return (
    <div className="flex border border-[#084A24]/25" aria-label="Language">
      {(["en", "hr"] as const).map((item) => (
        <a
          key={item}
          href={`/api/locale?locale=${item}&next=${encodeURIComponent(nextPath)}`}
          className={`px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
            locale === item ? "bg-[#E7390D] text-[#F2EDD5]" : "text-[#04261E] hover:bg-[#F26716]/20"
          }`}
          aria-current={locale === item ? "true" : undefined}
        >
          {item}
        </a>
      ))}
    </div>
  );
}
