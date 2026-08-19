export type Beat = {
  id: string;
  title: string;
  slug: string;
  bpm: number | null;
  key: string | null;
  genre: string | null;
  mood: string | null;
  tags: string[] | null;
  preview_url: string;
  full_mp3_url: string;
  full_wav_url: string;
  lease_price: number;
  exclusive_price: number;
  is_exclusive_sold: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
