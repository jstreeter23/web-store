import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Beat not found</h1>
      <p className="mt-2 text-zinc-400">It may be inactive or exclusive-sold.</p>
      <Link href="/" className="mt-6 text-violet-300 hover:text-violet-200">
        Back to catalog
      </Link>
    </main>
  );
}
