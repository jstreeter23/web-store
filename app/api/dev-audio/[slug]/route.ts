import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type SourceMap = Record<string, string>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { slug } = await params;
  const mapPath = path.join(process.cwd(), ".local-beat-sources.json");

  let sources: SourceMap;
  try {
    sources = JSON.parse(await readFile(mapPath, "utf8")) as SourceMap;
  } catch {
    return new NextResponse("No local beat map", { status: 404 });
  }

  const filePath = sources[slug];
  if (!filePath || filePath.includes("\0") || filePath.includes("..")) {
    return new NextResponse("Unknown beat", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".wav" ? "audio/wav" : "audio/mpeg";
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=0",
      },
    });
  } catch {
    return new NextResponse("Missing file", { status: 404 });
  }
}
