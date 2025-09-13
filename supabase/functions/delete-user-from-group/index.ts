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
    const { group_id, user_id } = await req.json();
    if (!group_id || typeof group_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'group_id'" }), { status: 400, headers: corsHeaders });
    }
    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'user_id'" }), { status: 400, headers: corsHeaders });
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

    const { data: groupMember, error: memberError } = await supabase
      .from("group_member")
      .select("role_id")
      .eq("group_id", group_id)
      .eq("user_id", userData.user.id)
      .single();
    
    if (memberError || !groupMember) {
      return new Response(JSON.stringify({ error: "User is not a member of this group" }), { status: 403, headers: corsHeaders });
    }

    if (groupMember.role_id !== 1 && user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Only admins can remove other users from the group" }), { status: 403, headers: corsHeaders });
    }

    const { data: targetMember, error: targetError } = await supabase
      .from("group_member")
      .select("group_id, user_id")
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .single();
    
    if (targetError || !targetMember) {
      return new Response(JSON.stringify({ error: "User is not a member of this group" }), { status: 404, headers: corsHeaders });
    }

    const { error: deleteError } = await supabase
      .from("group_member")
      .delete()
      .eq("group_id", group_id)
      .eq("user_id", user_id);
    
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
