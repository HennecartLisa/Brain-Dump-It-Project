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
    const { data: statuses, error: statusError } = await supabase
      .from("task_status")
      .select("id, name")
      .in("name", ["Done", "To Do"]);

    if (statusError || !statuses) {
      return new Response(
        JSON.stringify({ error: "Failed to get task statuses" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const doneStatus = statuses.find(s => s.name === "Done");
    const todoStatus = statuses.find(s => s.name === "To Do");

    if (!doneStatus || !todoStatus) {
      return new Response(
        JSON.stringify({ error: "Required task statuses (Done, To Do) not found" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: doneTasks, error: fetchError } = await supabase
      .from("task")
      .select(`
        id,
        name,
        list!inner(
          id,
          name,
          is_routine
        )
      `)
      .eq("task_status_id", doneStatus.id)
      .eq("list.is_routine", true);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch done tasks from routines: ${fetchError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!doneTasks || doneTasks.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No done tasks found in routine lists to reset",
          data: { 
            reset_count: 0,
            processed_at: new Date().toISOString()
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const taskIds = doneTasks.map(task => task.id);
    const { error: updateError } = await supabase
      .from("task")
      .update({
        task_status_id: todoStatus.id,
        last_active_at: new Date().toISOString()
      })
      .in("id", taskIds);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to reset tasks to To Do: ${updateError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully reset ${doneTasks.length} done tasks to To Do in routine lists`,
        data: { 
          reset_count: doneTasks.length,
          processed_at: new Date().toISOString(),
          tasks_reset: doneTasks.map(task => ({
            id: task.id,
            name: task.name,
            list_name: task.list.name,
            list_id: task.list.id
          }))
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Unexpected error during batch routine task reset:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
