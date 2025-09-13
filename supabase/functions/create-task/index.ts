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

  const { name, list_id, repeat_id, importance_id, last_active_at } = await req.json();

  if (!name || typeof name !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'name'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  if (!list_id || typeof list_id !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'list_id'" }), {
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

  const insertObjTask: any = { name, created_by: user.id };
  if (repeat_id !== undefined) insertObjTask.repeat_id = repeat_id;
  if (importance_id !== undefined) insertObjTask.importance_id = importance_id;
  if (last_active_at !== undefined) insertObjTask.last_active_at = last_active_at;

  const { data: taskData, error: taskError } = await supabase
    .from("task")
    .insert([insertObjTask])
    .select()
    .single();

  if (taskError) {
    return new Response(JSON.stringify({ error: taskError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  if (taskData && taskData.id && list_id) {
    const { data: listTaskData, error: listTaskError } = await supabase
      .from("list_task")
      .insert([{ list_id, task_id: taskData.id }]);

    if (listTaskError) {
      return new Response(JSON.stringify({ error: listTaskError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }

  return new Response(JSON.stringify({ task: taskData }), {
    status: 201,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
});