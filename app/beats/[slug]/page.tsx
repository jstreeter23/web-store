import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { StoreHeader } from "@/components/StoreHeader";
import { getBeatBySlug } from "@/lib/beats";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BeatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);

  if (!beat) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col">
      <StoreHeader />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 lg:grid-cols-2 sm:px-6">
        <section>
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-zinc-400 hover:text-zinc-200"
          >
            ← Catalog
          </Link>
          <div className="mb-8 aspect-square rounded-2xl bg-linear-to-br from-violet-700 via-fuchsia-700 to-amber-600 shadow-2xl" />
          <h1 className="text-4xl font-semibold tracking-tight">{beat.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {beat.bpm ? (
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                {beat.bpm} BPM
              </span>
            ) : null}
            {beat.key ? (
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                {beat.key}
              </span>
            ) : null}
          </div>
          <div className="mt-8">
            <AudioPlayer url={beat.preview_url} title={beat.title} />
          </div>
        </section>

        <aside className="lg:pt-12">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold">Licenses</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-zinc-700 p-4">
                <div className="text-sm text-zinc-400">Lease</div>
                <div className="text-2xl font-bold">
                  {formatPrice(Number(beat.lease_price))}
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Non-exclusive. MP3 + WAV. Credit required.
                </p>
              </div>
              <div className="rounded-xl border border-violet-700/60 p-4">
                <div className="text-sm text-zinc-400">Exclusive</div>
                <div className="text-2xl font-bold text-violet-300">
                  {formatPrice(Number(beat.exclusive_price))}
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Exclusive rights. Beat leaves the catalog.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-zinc-500">
              Checkout is next. Stripe is not wired yet.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
