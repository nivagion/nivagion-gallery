"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function WorkSortForm() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(search);
    if (value === "all" || value === "manual") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <label className="label w-full sm:w-auto">
        Sort
        <select className="field min-w-44" defaultValue={search.get("sort") ?? "manual"} onChange={(event) => update("sort", event.target.value)}>
          <option value="manual">Custom order</option>
          <option value="newest">Newest first</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
        </select>
      </label>
      <label className="label w-full sm:w-auto">
        Filter
        <select className="field min-w-44" defaultValue={search.get("availability") ?? "all"} onChange={(event) => update("availability", event.target.value)}>
          <option value="all">All visible</option>
          <option value="available">Available</option>
          <option value="sold">Sold archive</option>
        </select>
      </label>
    </div>
  );
}
