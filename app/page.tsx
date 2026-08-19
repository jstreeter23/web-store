import { BeatCard } from "@/components/BeatCard";
import { StoreHeader } from "@/components/StoreHeader";
import { getCatalogBeats } from "@/lib/beats";
import type { Beat } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let beats: Beat[] = [];
  let loadError: string | null = null;

  try {
    beats = await getCatalogBeats();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load catalog";
  }

  return (
    <div className="flex min-h-full flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Catalog
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Lease for $50 or buy exclusive for $199. Credit always required:
            Prod. by Jordan.
          </p>
        </div>

        {loadError ? (
          <p className="rounded-xl border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
            {loadError}. Check Supabase env vars in <code>.env.local</code>.
          </p>
        ) : beats.length === 0 ? (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-8 text-center text-zinc-400">
            No beats in the catalog yet. Run{" "}
            <code className="text-zinc-200">npm run import:beats -- --dry-run</code>{" "}
            to preview the migration folder.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-zinc-500">
              {beats.length} {beats.length === 1 ? "beat" : "beats"}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {beats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} />
              ))}
            </div>
          </>
        )}
      </main>
      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Prod. by Jordan
      </footer>
    </div>
  );
}
