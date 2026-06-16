let adminClient = null;

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseAdmin() {
  if (!hasSupabaseConfig()) return null;
  if (adminClient) return adminClient;

  const { createClient } = require("@supabase/supabase-js");
  adminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

module.exports = { getSupabaseAdmin, hasSupabaseConfig };
