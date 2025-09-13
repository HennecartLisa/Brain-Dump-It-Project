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
    error: userError
  } = await supabase.auth.getUser(jwt);

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized or Could not authenticate user" }),
      { status: 401, 
        headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const { list_id } = await req.json();

  if (!list_id || typeof list_id !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'list_id'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const { data, error } = await supabase
    .from("task")
    .select(`
      *,
      task_status!inner(
        id,
        name
      ),
      importance!inner(
        id,
        name
      ),
      task_effort(
        id,
        label,
        minutes
      ),
      repeat(
        id,
        label,
        periods_id,
        interval_value,
        day_of_week,
        day_of_month,
        is_builtin,
        created_at,
        periods!inner(
          id,
          name
        )
      ),
      list_task!inner(
        list_id,
        list!inner(
          id,
          name,
          created_by
        )
      )
    `)
    .eq("list_task.list_id", list_id)
    .eq("list_task.list.created_by", user.id);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  return new Response(
    JSON.stringify({ tasks: data }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});
