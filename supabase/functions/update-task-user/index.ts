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
    
    const { task_id, user_id, status } = requestBody;
    
    console.log('Parsed parameters:', { task_id, user_id, status });
    
    if (!task_id || typeof task_id !== "string") {
      console.log('Invalid task_id:', task_id);
      return new Response(JSON.stringify({ error: "Missing or invalid 'task_id'" }), { status: 400, headers: corsHeaders });
    }
    
    if (!user_id || typeof user_id !== "string") {
      console.log('Invalid user_id:', user_id);
      return new Response(JSON.stringify({ error: "Missing or invalid 'user_id'" }), { status: 400, headers: corsHeaders });
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

    const { data: taskData, error: taskError } = await supabase
      .from("task")
      .select("id, created_by")
      .eq("id", task_id)
      .single();
    
    if (taskError || !taskData) {
      return new Response(JSON.stringify({ error: "Task not found" }), { status: 404, headers: corsHeaders });
    }

    const isTaskOwner = taskData.created_by === userData.user.id;
    const isSelfAssignment = user_id === userData.user.id;
    
    if (!isTaskOwner && !isSelfAssignment) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "You can only assign tasks you created or assign yourself to tasks"
      }), { status: 200, headers: corsHeaders });
    }

    const { data: targetUser, error: targetUserError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .single();
    
    if (targetUserError || !targetUser) {
      return new Response(JSON.stringify({ error: "Target user not found" }), { status: 404, headers: corsHeaders });
    }

    const { data: statusData, error: statusError } = await supabase
      .from("user_status")
      .select("id")
      .eq("name", status)
      .single();
    
    if (statusError || !statusData) {
      return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400, headers: corsHeaders });
    }

    const { data: existingAssignment, error: checkError } = await supabase
      .from("task_user")
      .select("task_id, user_id, user_status_id")
      .eq("task_id", task_id)
      .eq("user_id", user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      return new Response(JSON.stringify({ error: "Error checking existing assignment" }), { status: 500, headers: corsHeaders });
    }

    let result;
    
    if (existingAssignment) {
      const updateData: any = { user_status_id: statusData.id };
      
      if (status === "Accepted" || status === "Done") {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { data: updateResult, error: updateError } = await supabase
        .from("task_user")
        .update(updateData)
        .eq("task_id", task_id)
        .eq("user_id", user_id)
        .select()
        .single();

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: corsHeaders });
      }
      
      result = updateResult;
    } else {
      const insertData: any = {
        task_id: task_id,
        user_id: user_id,
        user_status_id: statusData.id,
        assigned_at: new Date().toISOString()
      };

      if (status === "Accepted" || status === "Done") {
        insertData.completed_at = new Date().toISOString();
      }

      const { data: insertResult, error: insertError } = await supabase
        .from("task_user")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders });
      }
      
      result = insertResult;
    }

    return new Response(JSON.stringify({ success: true, data: result }), { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error('Internal server error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});