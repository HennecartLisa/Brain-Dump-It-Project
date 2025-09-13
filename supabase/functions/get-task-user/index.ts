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
    const { task_id } = await req.json();
    
    if (!task_id || typeof task_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'task_id'" }), { status: 400, headers: corsHeaders });
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

    const { data: taskData, error: taskError } = await supabase
      .from("task")
      .select("id")
      .eq("id", task_id)
      .single();
    
    if (taskError || !taskData) {
      return new Response(JSON.stringify({ error: "Task not found" }), { status: 404, headers: corsHeaders });
    }

    const { data: taskUsers, error: taskUsersError } = await supabase
      .from("task_user")
      .select(`
        task_id,
        user_id,
        user_status_id,
        assigned_at,
        completed_at
      `)
      .eq("task_id", task_id);

    if (taskUsersError) {
      console.error('Error fetching task users:', taskUsersError);
      return new Response(JSON.stringify({ error: `Failed to fetch task users: ${taskUsersError.message}` }), { status: 500, headers: corsHeaders });
    }

    const userIds = [...new Set((taskUsers || []).map((tu: any) => tu.user_id))];
    const statusIds = [...new Set((taskUsers || []).map((tu: any) => tu.user_status_id))];

    const [profilesResult, statusesResult] = await Promise.all([
      supabase.from("profiles").select("id, display_name").in("id", userIds),
      supabase.from("user_status").select("id, name").in("id", statusIds)
    ]);

    if (profilesResult.error) {
      console.error('Error fetching profiles:', profilesResult.error);
    }

    if (statusesResult.error) {
      console.error('Error fetching statuses:', statusesResult.error);
    }

    const transformedUsers = (taskUsers || []).map((tu: any) => {
      const profile = profilesResult.data?.find((p: any) => p.id === tu.user_id);
      const status = statusesResult.data?.find((s: any) => s.id === tu.user_status_id);

      return {
        id: `${tu.task_id}-${tu.user_id}`, // Create a composite ID since there's no separate id field
        task_id: tu.task_id,
        user: {
          id: tu.user_id,
          display_name: profile?.display_name || 'Unknown'
        },
        status: {
          id: tu.user_status_id,
          name: status?.name || 'Unknown'
        },
        assigned_at: tu.assigned_at,
        completed_at: tu.completed_at
      };
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: transformedUsers 
    }), { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error('Internal server error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});