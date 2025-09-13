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
    const { data: inactiveStatus, error: statusError } = await supabase
      .from("user_status")
      .select("id")
      .eq("name", "Inactive")
      .single();

    if (statusError || !inactiveStatus) {
      return new Response(
        JSON.stringify({ error: "Failed to get user status: Inactive status not found" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoISO = oneYearAgo.toISOString();

    const { data: inactiveUsers, error: fetchError } = await supabase
      .from("profiles")
      .select("id, display_name, updated_at")
      .lt("updated_at", oneYearAgoISO);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch inactive users: ${fetchError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No inactive users found to anonymize",
          data: { 
            anonymized_count: 0,
            processed_at: new Date().toISOString()
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const anonymizedUsers = [];

    for (const user of inactiveUsers) {
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            display_name: `Deleted User ${user.id.substring(0, 8)}`,
            email: null,
            consent_form_agreement: null,
            cookies_date: null,
            emotion: null,
            max_tasks_effort_per_day: null,
            max_tasks_per_day: null,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);

        if (profileError) {
          console.error(`Failed to anonymize profile for user ${user.id}:`, profileError);
          continue;
        }

        await supabase
          .from("task")
          .update({
            name: "[Deleted Task]",
            created_by: null,
            updated_at: new Date().toISOString()
          })
          .eq("created_by", user.id);

        await supabase
          .from("list")
          .update({
            name: "[Deleted List]",
            created_by: null,
            updated_at: new Date().toISOString()
          })
          .eq("created_by", user.id);

        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (authDeleteError) {
          console.error(`Failed to delete user ${user.id} from auth:`, authDeleteError);
        }

        anonymizedUsers.push({
          id: user.id,
          display_name: user.display_name,
          last_active: user.updated_at
        });

      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully anonymized ${anonymizedUsers.length} inactive users`,
        data: { 
          anonymized_count: anonymizedUsers.length,
          processed_at: new Date().toISOString(),
          cutoff_date: oneYearAgoISO,
          anonymized_users: anonymizedUsers
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Unexpected error during batch user anonymization:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
