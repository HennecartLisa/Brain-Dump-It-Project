import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Start the Edge Function
Deno.serve(async (req) => {
  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return new Response(
      JSON.stringify({ error: "Missing or invalid 'name' field" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("display_name", name)
    .maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const available = data === null;
  return new Response(
    JSON.stringify({ available }),
    { headers: { "Content-Type": "application/json" } }
  );
});