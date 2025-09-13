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

  const { display_name } = await req.json();

  if (!display_name || typeof display_name !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'display_name'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "User profile already exists" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: statusData, error: statusError } = await supabase
      .from("general_status")
      .select("id")
      .eq("name", "Active")
      .single();

    if (statusError || !statusData) {
      return new Response(
        JSON.stringify({ error: "Failed to get Active status ID" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const activeStatusId = statusData.id;

    const { error: profileError } = await supabase.from("profiles").insert([{ 
      id: user.id, 
      display_name: display_name,
      consent_form_agreement: new Date().toISOString()
    }]);

    if (profileError) {
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: groupData, error: groupError } = await supabase.from("groups").insert([{
      name: "My village",
      score: -1,
      created_by: user.id,
      general_status_id: activeStatusId,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    }]).select("id").single();

    if (groupError || !groupData) {
      return new Response(
        JSON.stringify({ error: `Failed to create default group: ${groupError?.message || 'No group data returned'}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_role")
      .select("id")
      .eq("name", "admin")
      .single();

    const { data: userStatusData, error: userStatusError } = await supabase
      .from("user_status")
      .select("id")
      .eq("name", "Accepted")
      .single();

    if (roleError || !roleData || userStatusError || !userStatusData) {
      return new Response(
        JSON.stringify({ error: `Failed to get role or status IDs: ${roleError?.message || userStatusError?.message || 'Missing data'}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: memberError } = await supabase.from("group_member").insert([{
      group_id: groupData.id,
      user_id: user.id,
      role_id: roleData.id,
      user_status_id: userStatusData.id,
      score: 0,
      joined_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    }]);

    if (memberError) {
      return new Response(
        JSON.stringify({ error: `Failed to add user to group: ${memberError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "User profile and default group created successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});