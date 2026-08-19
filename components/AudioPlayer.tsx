"use client";

export function AudioPlayer({ url, title }: { url: string; title: string }) {
  if (!url) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-6 text-sm text-zinc-400">
        Preview audio is not uploaded yet. Import with R2 credentials, or use{" "}
        <code className="text-zinc-200">--local</code> for development.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-3 text-sm text-zinc-400">Preview · {title}</p>
      <audio className="w-full" controls preload="metadata" src={url}>
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
