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

  // Task status id numbers are:
  // 1: To Do
  // 2: Done
  // 3: Active
  // 4: Inactive
  // 5: Reported
  // 6: In progress
  // 7: On hold
  const { task_id, task_status_id } = await req.json();

  if (!task_id || typeof task_id !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'task_id'" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (!task_status_id || typeof task_status_id !== "number") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'task_status_id'" }), {
      status: 400,
      headers: corsHeaders
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
      headers: corsHeaders
    });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(jwt);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized or Could not authenticate user" }), {
      status: 401,
      headers: corsHeaders
    });
  }

  const { data: statusData, error: statusError } = await supabase
    .from("task_status")
    .select("id")
    .eq("id", task_status_id)
    .single();

  if (statusError || !statusData) {
    return new Response(JSON.stringify({ error: "Invalid task_status_id. Status does not exist." }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const { data: existingTask, error: taskCheckError } = await supabase
    .from("task")
    .select("id, task_status_id, days_done")
    .eq("id", task_id)
    .single();

  if (taskCheckError || !existingTask) {
    return new Response(JSON.stringify({ error: "Task not found" }), {
      status: 404,
      headers: corsHeaders
    });
  }

  let newDaysDone = existingTask.days_done || 0;
  
  if (task_status_id === 2 && existingTask.task_status_id !== 2) {
    newDaysDone += 1;
  }
  else if (existingTask.task_status_id === 2 && task_status_id !== 2) {
    newDaysDone = Math.max(0, newDaysDone - 1);
  }

  const { data: updatedTask, error: updateError } = await supabase
    .from("task")
    .update({ 
      task_status_id: task_status_id,
      days_done: newDaysDone,
      last_active_at: new Date().toISOString()
    })
    .eq("id", task_id)
    .select()
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
      headers: corsHeaders
    });
  }

  return new Response(JSON.stringify({ 
    message: "Task status updated successfully",
    task: updatedTask 
  }), {
    status: 200,
    headers: corsHeaders
  });
});