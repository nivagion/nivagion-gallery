"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "../../lib/i18n-copy";
import { t } from "../../lib/i18n-copy";

export function WorkSortForm({ locale = "en" }: { locale?: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const c = t(locale);

  function update(key: string, value: string) {
    const next = new URLSearchParams(search);
    if (value === "all" || value === "manual") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <label className="label w-full sm:w-auto">
        {c.works.sort}
        <select className="field min-w-44" defaultValue={search.get("sort") ?? "manual"} onChange={(event) => update("sort", event.target.value)}>
          <option value="manual">{c.works.custom}</option>
          <option value="newest">{c.works.newest}</option>
          <option value="price-asc">{c.works.low}</option>
          <option value="price-desc">{c.works.high}</option>
        </select>
      </label>
      <label className="label w-full sm:w-auto">
        {c.works.filter}
        <select className="field min-w-44" defaultValue={search.get("availability") ?? "all"} onChange={(event) => update("availability", event.target.value)}>
          <option value="all">{c.works.all}</option>
          <option value="available">{c.works.available}</option>
          <option value="unavailable">{c.works.unavailable}</option>
        </select>
      </label>
    </div>
  );
}
