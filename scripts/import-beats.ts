import { createClient } from "@supabase/supabase-js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseBeatFilename } from "./parse-beat-filename";

const AUDIO_EXT = new Set([".mp3", ".wav"]);
const MAP_PATH = path.join(process.cwd(), ".local-beat-sources.json");

function loadEnvFile(filePath: string) {
  try {
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const eq = trimmed.indexOf("=");
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKey || !secretKey) return null;
  if (accountId.startsWith("your_")) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}

async function uploadToR2(
  client: S3Client,
  bucket: string,
  key: string,
  filePath: string,
  contentType: string,
) {
  const body = await readFile(filePath);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function main() {
  const dryRun = !hasFlag("--apply") && !hasFlag("--local");
  const local = hasFlag("--local");
  const apply = hasFlag("--apply");
  const limit = Number(argValue("--limit") ?? "0") || 0;
  const dir =
    argValue("--dir") ||
    process.env.BEAT_IMPORT_DIR ||
    "";

  if (!dir) {
    throw new Error("Set BEAT_IMPORT_DIR or pass --dir to the audio folder");
  }

  const names = (await readdir(dir)).filter((name) =>
    AUDIO_EXT.has(path.extname(name).toLowerCase()),
  );
  const parsed = names.map(parseBeatFilename);
  const skipped = parsed.filter((row) => row.skipReason);
  let rows = parsed.filter((row) => !row.skipReason);
  if (limit > 0) rows = rows.slice(0, limit);

  const slugs = new Map<string, number>();
  for (const row of rows) {
    const count = slugs.get(row.slug) ?? 0;
    slugs.set(row.slug, count + 1);
    if (count > 0) row.slug = `${row.slug}-${count + 1}`;
  }

  console.log(
    `${names.length} audio files · ${rows.length} importable · ${skipped.length} skipped`,
  );
  for (const row of rows.slice(0, 12)) {
    console.log(
      `  ${row.bpm ?? "?"} BPM  ${row.key ?? "-"}  ${row.title}  [${row.slug}]`,
    );
  }
  if (rows.length > 12) console.log(`  … ${rows.length - 12} more`);
  if (skipped.length) {
    console.log("Skipped:");
    for (const row of skipped) {
      console.log(`  ${row.filename} — ${row.skipReason}`);
    }
  }

  if (dryRun) {
    console.log("\nDry run. Use --local (dev previews) or --apply (R2 upload).");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const sourceMap: Record<string, string> = {};
  let uploaded = 0;

  if (apply) {
    const s3 = r2Client();
    const bucket = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!s3 || !bucket || !publicUrl || publicUrl.includes("your-bucket")) {
      throw new Error("R2 env vars are missing or still placeholders");
    }

    for (const row of rows) {
      const filePath = path.join(dir, row.filename);
      const ext = path.extname(row.filename).toLowerCase();
      const contentType = ext === ".wav" ? "audio/wav" : "audio/mpeg";
      const previewKey = `beats/${row.slug}/preview.mp3`;
      const fullKey =
        ext === ".wav"
          ? `beats/${row.slug}/full.wav`
          : `beats/${row.slug}/full.mp3`;

      await uploadToR2(s3, bucket, previewKey, filePath, contentType);
      await uploadToR2(s3, bucket, fullKey, filePath, contentType);

      const previewUrl = `${publicUrl.replace(/\/$/, "")}/${previewKey}`;
      const fullUrl = `${publicUrl.replace(/\/$/, "")}/${fullKey}`;

      const { error } = await supabase.from("beats").upsert(
        {
          title: row.title,
          slug: row.slug,
          bpm: row.bpm,
          key: row.key,
          tags: row.tags.length ? row.tags : null,
          preview_url: previewUrl,
          full_mp3_url: ext === ".mp3" ? fullUrl : "",
          full_wav_url: ext === ".wav" ? fullUrl : "",
          is_active: true,
          is_exclusive_sold: false,
        },
        { onConflict: "slug" },
      );
      if (error) throw error;
      uploaded += 1;
      console.log(`uploaded ${row.slug}`);
    }
  } else if (local) {
    for (const row of rows) {
      const filePath = path.join(dir, row.filename);
      sourceMap[row.slug] = filePath;
      const previewUrl = `/api/dev-audio/${row.slug}`;
      const { error } = await supabase.from("beats").upsert(
        {
          title: row.title,
          slug: row.slug,
          bpm: row.bpm,
          key: row.key,
          tags: row.tags.length ? row.tags : null,
          preview_url: previewUrl,
          full_mp3_url: "",
          full_wav_url: "",
          is_active: true,
          is_exclusive_sold: false,
        },
        { onConflict: "slug" },
      );
      if (error) throw error;
      uploaded += 1;
    }
    await writeFile(MAP_PATH, JSON.stringify(sourceMap, null, 2));
    console.log(`Wrote ${MAP_PATH} with ${uploaded} local preview paths`);
  }

  console.log(`Imported ${uploaded} beats`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
