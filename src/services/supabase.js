import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Null until .env is filled in, so the site still runs locally without a backend.
export const supabase = url && key ? createClient(url, key) : null;
