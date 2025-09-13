import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
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

  const { group_id, user_id, status } = await req.json();

  if (!group_id || typeof group_id !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'group_id'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  if (!user_id || typeof user_id !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'user_id'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  if (!status || typeof status !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'status'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const validStatuses = ["Accepted", "Rejected", "Inactive", "Removed"];
  if (!validStatuses.includes(status)) {
    return new Response(JSON.stringify({ 
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    const { data: existingMember, error: checkError } = await supabase
      .from("group_member")
      .select("user_id, group_id")
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .single();

    if (checkError || !existingMember) {
      return new Response(
        JSON.stringify({ error: "Group member record not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: statusData, error: statusError } = await supabase
      .from("user_status")
      .select("id")
      .eq("name", status)
      .single();

    if (statusError || !statusData) {
      return new Response(
        JSON.stringify({ error: `Failed to get status ID for '${status}': ${statusError?.message || 'Status not found'}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: updatedMember, error: updateError } = await supabase
      .from("group_member")
      .update({
        user_status_id: statusData.id,
        last_active_at: new Date().toISOString()
      })
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update group member status: ${updateError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Group member status updated to '${status}' successfully`,
        data: updatedMember
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});