import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  const { name, repeat_id, importance_id, last_active_at, is_routine } = await req.json();

  if (!name || typeof name !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'name'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.replace("Bearer ", "");

  if (!jwt) {
    return new Response(JSON.stringify({ error: "Missing auth token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(jwt);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized or Could not authenticate user" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const insertObj: any = { name, created_by: user.id };
  if (repeat_id !== undefined) insertObj.repeat_id = repeat_id;
  if (importance_id !== undefined) insertObj.importance_id = importance_id;
  if (last_active_at !== undefined) insertObj.last_active_at = last_active_at;
  if (is_routine !== undefined) insertObj.is_routine = is_routine;

  const { data, error } = await supabase
    .from("list")
    .insert([insertObj])
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  return new Response(JSON.stringify({ list: data }), {
    status: 201,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
});