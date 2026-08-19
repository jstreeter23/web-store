import { createClient } from "@/lib/supabase/server";
import type { Beat } from "@/lib/types";

export async function getCatalogBeats(): Promise<Beat[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beats")
    .select("*")
    .eq("is_active", true)
    .eq("is_exclusive_sold", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Beat[];
}

export async function getBeatBySlug(slug: string): Promise<Beat | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beats")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_exclusive_sold", false)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Beat | null) ?? null;
}
