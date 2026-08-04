import Link from "next/link";
import { SiteHeader } from "../components/public/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[70vh] max-w-3xl content-center px-4 py-20 text-center">
        <h1 className="editorial-title text-5xl">Page not found</h1>
        <p className="mt-4 text-[#746f67]">The page may have moved, or the artwork is no longer public.</p>
        <Link href="/works" className="button mx-auto mt-8">
          Browse works
        </Link>
      </main>
    </>
  );
}
