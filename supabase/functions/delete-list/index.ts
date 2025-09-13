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

  try {
    const { list_id } = await req.json();
    if (!list_id || typeof list_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'list_id'" }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), { status: 401, headers: corsHeaders });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized or Could not authenticate user" }), { status: 401, headers: corsHeaders });
    }

    const { data: listRow, error: listErr } = await supabase
      .from("list")
      .select("id, created_by")
      .eq("id", list_id)
      .single();

    if (listErr || !listRow) {
      return new Response(JSON.stringify({ error: "List not found" }), { status: 404, headers: corsHeaders });
    }
    if (listRow.created_by !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { data: listTasks, error: ltErr } = await supabase
      .from("list_task")
      .select("task_id")
      .eq("list_id", list_id);

    if (ltErr) {
      return new Response(JSON.stringify({ error: ltErr.message }), { status: 500, headers: corsHeaders });
    }

    const taskIds = (listTasks || []).map((lt: any) => lt.task_id);

    if (taskIds.length > 0) {
      const { error: tErr } = await supabase
        .from("task")
        .delete()
        .in("id", taskIds);
      if (tErr) {
        return new Response(JSON.stringify({ error: tErr.message }), { status: 500, headers: corsHeaders });
      }
    }

    const { error: lErr } = await supabase
      .from("list")
      .delete()
      .eq("id", list_id);
    if (lErr) {
      return new Response(JSON.stringify({ error: lErr.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});

