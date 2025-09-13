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

  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.replace("Bearer ", "");

  if (!jwt) {
    return new Response(
      JSON.stringify({ error: "Missing auth token" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(jwt);

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized or Could not authenticate user" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { data: transactionData, error: transactionError } = await supabase.rpc('begin_transaction');
    
    if (transactionError) {
      console.error("Failed to begin transaction:", transactionError);
    }

    const { data: removedStatus, error: statusError } = await supabase
      .from("user_status")
      .select("id")
      .eq("name", "Removed")
      .single();

    if (statusError || !removedStatus) {
      return new Response(
        JSON.stringify({ error: "Failed to get user status: Removed status not found" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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
      console.error("Failed to anonymize profile:", profileError);
      return new Response(
        JSON.stringify({ error: `Failed to anonymize profile: ${profileError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: groupMembersError } = await supabase
      .from("group_member")
      .update({
        user_status_id: removedStatus.id,
        score: 0,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (groupMembersError) {
      console.error("Failed to update group memberships:", groupMembersError);
      return new Response(
        JSON.stringify({ error: `Failed to update group memberships: ${groupMembersError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: tasksError } = await supabase
      .from("task")
      .update({
        name: "[Deleted Task]",
        created_by: null,
        updated_at: new Date().toISOString()
      })
      .eq("created_by", user.id);

    if (tasksError) {
      console.error("Failed to anonymize tasks:", tasksError);
      return new Response(
        JSON.stringify({ error: `Failed to anonymize tasks: ${tasksError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: listsError } = await supabase
      .from("list")
      .update({
        name: "[Deleted List]",
        created_by: null,
        updated_at: new Date().toISOString()
      })
      .eq("created_by", user.id);

    if (listsError) {
      console.error("Failed to anonymize lists:", listsError);
      return new Response(
        JSON.stringify({ error: `Failed to anonymize lists: ${listsError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error("Failed to delete user from auth:", authDeleteError);
      return new Response(
        JSON.stringify({ error: `Failed to delete user from authentication: ${authDeleteError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User account successfully anonymized and removed",
        data: {
          anonymized_at: new Date().toISOString(),
          user_id: user.id
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Unexpected error during user anonymization:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});