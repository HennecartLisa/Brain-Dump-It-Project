import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { data: todoStatus, error: statusError } = await supabase
      .from("task_status")
      .select("id")
      .eq("name", "To Do")
      .single();

    if (statusError || !todoStatus) {
      return new Response(
        JSON.stringify({ error: "Failed to get task status: To Do status not found" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const { data: pastTasks, error: fetchError } = await supabase
      .from("task")
      .select("id, deadline")
      .eq("task_status_id", todoStatus.id)
      .lt("deadline", today);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch past tasks: ${fetchError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!pastTasks || pastTasks.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No past tasks found to update",
          data: { 
            updated_count: 0,
            processed_at: new Date().toISOString()
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const taskIds = pastTasks.map(task => task.id);
    const { error: updateError } = await supabase
      .from("task")
      .update({
        deadline: today,
        last_active_at: new Date().toISOString()
      })
      .in("id", taskIds);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update tasks: ${updateError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully updated ${pastTasks.length} tasks to today's date`,
        data: { 
          updated_count: pastTasks.length,
          processed_at: new Date().toISOString(),
          updated_to_date: today
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Unexpected error during batch task update:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});