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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoISO = sixMonthsAgo.toISOString();

    const { data: inactiveUsers, error: fetchError } = await supabase
      .from("profiles")
      .select("id, display_name, updated_at")
      .lt("updated_at", sixMonthsAgoISO);

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
          message: "No inactive users found to update",
          data: { 
            updated_count: 0,
            processed_at: new Date().toISOString()
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userIds = inactiveUsers.map(user => user.id);
    const { error: updateError } = await supabase
      .from("group_member")
      .update({
        user_status_id: inactiveStatus.id,
        updated_at: new Date().toISOString()
      })
      .in("user_id", userIds);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update user statuses: ${updateError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully set ${inactiveUsers.length} users to inactive status`,
        data: { 
          updated_count: inactiveUsers.length,
          processed_at: new Date().toISOString(),
          cutoff_date: sixMonthsAgoISO,
          users_updated: inactiveUsers.map(user => ({
            id: user.id,
            display_name: user.display_name,
            last_active: user.updated_at
          }))
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Unexpected error during batch user status update:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});