/* Supabase connection — see dashboard/SETUP.md.
   Leave both empty to run the website and dashboard in demo mode.
   The anon key is public by design: database security comes from the
   row-level security rules in supabase/schema.sql. */
window.APP_CONFIG = {
  supabaseUrl: "",       // e.g. "https://abcdefgh.supabase.co"
  supabaseAnonKey: ""    // Project Settings → API → "anon public" key
};
