export type ParsedBeat = {
  filename: string;
  title: string;
  slug: string;
  bpm: number | null;
  key: string | null;
  tags: string[];
  skipReason: string | null;
};

const SKIP_PATTERN =
  /choir|james cleveland|mississippi children|where is your faith|anointing \(1981\)/i;

const KEY_NAMES =
  "C#|Db|D#|Eb|F#|Gb|G#|Ab|A#|Bb|C|D|E|F|G|A|B";
const KEY_BODY = new RegExp(
  `^(${KEY_NAMES})(?:\\s*(minor|major|min|maj|m))?$`,
  "i",
);

function normalizeKey(raw: string): string {
  const match = raw.trim().match(KEY_BODY);
  if (!match) return raw.trim();
  const note = match[1][0].toUpperCase() + match[1].slice(1);
  const quality = (match[2] ?? "").toLowerCase();
  if (!quality) return note;
  if (quality === "m" || quality.startsWith("min")) return `${note}m`;
  if (quality.startsWith("maj")) return `${note}maj`;
  return `${note}${quality}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseBeatFilename(filename: string): ParsedBeat {
  const stem = filename.replace(/\.(mp3|wav|flac|aiff?)$/i, "").trim();
  const tags = [...stem.matchAll(/@([A-Za-z0-9._]+)/g)].map((m) => m[1]);

  if (SKIP_PATTERN.test(stem)) {
    return {
      filename,
      title: stem,
      slug: slugify(stem) || "skipped",
      bpm: null,
      key: null,
      tags,
      skipReason: "Looks like a sample or choir track, not a store beat",
    };
  }

  let rest = stem.replace(/@([A-Za-z0-9._]+)/g, " ").replace(/\s+/g, " ").trim();
  rest = rest.replace(/[()_]+/g, " ").replace(/\s+/g, " ").trim();

  let bpm: number | null = null;
  const bpmMatch = rest.match(/^(\d{2,3})(?:\b|[_-])/);
  if (bpmMatch) {
    const value = Number(bpmMatch[1]);
    if (value >= 60 && value <= 220) {
      bpm = value;
      rest = rest.slice(bpmMatch[0].length).replace(/^[\s._-]+/, "").trim();
    }
  }

  let key: string | null = null;
  const tokens = rest.split(" ").filter(Boolean);
  if (tokens[0] && KEY_BODY.test(tokens[0])) {
    key = normalizeKey(tokens[0]);
    rest = tokens.slice(1).join(" ");
  } else if (tokens[0] && tokens[1] && KEY_BODY.test(`${tokens[0]} ${tokens[1]}`)) {
    key = normalizeKey(`${tokens[0]} ${tokens[1]}`);
    rest = tokens.slice(2).join(" ");
  } else if (tokens.length > 0) {
    const last = tokens[tokens.length - 1];
    if (KEY_BODY.test(last)) {
      key = normalizeKey(last);
      rest = tokens.slice(0, -1).join(" ");
    }
  }

  const title = rest.replace(/\s+/g, " ").trim() || stem;
  const slugBase = slugify(title) || slugify(stem) || "beat";

  return {
    filename,
    title,
    slug: bpm ? `${slugBase}-${bpm}` : slugBase,
    bpm,
    key,
    tags,
    skipReason: null,
  };
}
