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
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
    const { list_id, group_id, status } = requestBody;
    
    console.log('Parsed parameters:', { list_id, group_id, status });
    
    if (!list_id || typeof list_id !== "string") {
      console.log('Invalid list_id:', list_id);
      return new Response(JSON.stringify({ error: "Missing or invalid 'list_id'" }), { status: 400, headers: corsHeaders });
    }
    
    if (!group_id || typeof group_id !== "string") {
      console.log('Invalid group_id:', group_id);
      return new Response(JSON.stringify({ error: "Missing or invalid 'group_id'" }), { status: 400, headers: corsHeaders });
    }
    
    if (!status || typeof status !== "string") {
      console.log('Invalid status:', status);
      return new Response(JSON.stringify({ error: "Missing or invalid 'status'" }), { status: 400, headers: corsHeaders });
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
      .select(`
        user_status_id,
        user_status:user_status_id (name)
      `)
      .eq("group_id", group_id)
      .eq("user_id", userData.user.id)
      .single();
    
    if (memberError || !groupMember) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "User is not a member of this group"
      }), { status: 200, headers: corsHeaders });
    }
    
    if (groupMember.user_status?.name !== "Accepted") {
      return new Response(JSON.stringify({ 
        success: false,
        error: "User must have 'Accepted' status in the group"
      }), { status: 200, headers: corsHeaders });
    }

    const { data: listData, error: listError } = await supabase
      .from("list")
      .select("id")
      .eq("id", list_id)
      .single();
    
    if (listError || !listData) {
      return new Response(JSON.stringify({ error: "List not found" }), { status: 404, headers: corsHeaders });
    }

    const { data: statusData, error: statusError } = await supabase
      .from("general_status")
      .select("id")
      .eq("name", status)
      .single();
    
    if (statusError || !statusData) {
      return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400, headers: corsHeaders });
    }

    const { data: existingAssignment, error: checkError } = await supabase
      .from("list_group")
      .select("list_id, group_id, general_status_id")
      .eq("list_id", list_id)
      .eq("group_id", group_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      return new Response(JSON.stringify({ error: "Error checking existing assignment" }), { status: 500, headers: corsHeaders });
    }

    let result;
    
    if (existingAssignment) {
      const { data: updateData, error: updateError } = await supabase
        .from("list_group")
        .update({ general_status_id: statusData.id })
        .eq("list_id", list_id)
        .eq("group_id", group_id)
        .select()
        .single();

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: corsHeaders });
      }
      
      result = updateData;
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from("list_group")
        .insert({
          list_id: list_id,
          group_id: group_id,
          general_status_id: statusData.id
        })
        .select()
        .single();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders });
      }
      
      result = insertData;
    }

    return new Response(JSON.stringify({ success: true, data: result }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});