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

  const { group_id, user_id } = await req.json();

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

  try {
    const { data: existingMember } = await supabase
      .from("group_member")
      .select("user_id")
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .single();

    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "User is already a member of this group" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: statusData, error: statusError } = await supabase
      .from("user_status")
      .select("id")
      .eq("name", "Pending")
      .single();

    const { data: roleData, error: roleError } = await supabase
      .from("user_role")
      .select("id")
      .eq("name", "member")
      .single();

    if (statusError || !statusData || roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: `Failed to get status or role IDs: ${statusError?.message || roleError?.message || 'Missing data'}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: memberData, error: memberError } = await supabase
      .from("group_member")
      .insert([{
        group_id: group_id,
        user_id: user_id,
        role_id: roleData.id,
        user_status_id: statusData.id,
        score: 0,
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (memberError) {
      return new Response(
        JSON.stringify({ error: `Failed to add user to group: ${memberError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User added to group successfully",
        data: memberData
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