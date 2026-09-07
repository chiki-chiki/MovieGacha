import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be set. See .env.example."
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseClient(), prop, receiver);
  },
});
