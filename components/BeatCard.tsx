import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Beat } from "@/lib/types";

export function BeatCard({ beat }: { beat: Beat }) {
  return (
    <Link
      href={`/beats/${beat.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:border-zinc-600 hover:bg-zinc-900"
    >
      <div className="relative aspect-square bg-linear-to-br from-violet-700 via-fuchsia-700 to-amber-600">
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-6xl text-white/80">
          ♪
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-zinc-50 group-hover:text-violet-300">
          {beat.title}
        </h2>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
          {beat.bpm ? (
            <span className="rounded-full bg-zinc-800 px-2 py-1">{beat.bpm} BPM</span>
          ) : null}
          {beat.key ? (
            <span className="rounded-full bg-zinc-800 px-2 py-1">{beat.key}</span>
          ) : null}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-zinc-800 pt-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Lease</div>
            <div className="text-lg font-bold text-zinc-50">
              {formatPrice(Number(beat.lease_price))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Exclusive
            </div>
            <div className="text-lg font-bold text-violet-300">
              {formatPrice(Number(beat.exclusive_price))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
