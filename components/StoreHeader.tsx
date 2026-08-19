import Link from "next/link";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-xl font-semibold tracking-tight text-zinc-50">
            Beat Store
          </span>
          <span className="hidden text-sm text-zinc-500 sm:inline">
            Prod. by Jordan
          </span>
        </Link>
      </div>
    </header>
  );
}
