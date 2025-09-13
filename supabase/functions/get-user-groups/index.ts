// Enable Deno typing for Supabase Edge Functions
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

  try {
    const { data: userMemberships, error: membershipError } = await supabase
      .from("group_member")
      .select(`
        group_id,
        groups!inner(
          id,
          name,
          score,
          created_at,
          last_active_at
        )
      `)
      .eq("user_id", user.id);

    if (membershipError) {
      return new Response(
        JSON.stringify({ error: `Failed to get user memberships: ${membershipError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!userMemberships || userMemberships.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const groupsWithMembers = await Promise.all(
      userMemberships.map(async (membership) => {
        const group = membership.groups[0];
        
        const { data: basicMembers, error: basicError } = await supabase
          .from("group_member")
          .select(`
            user_id,
            score,
            joined_at,
            last_active_at,
            role_id,
            user_status_id
          `)
          .eq("group_id", group.id);

        const roleIds = basicMembers?.map(m => m.role_id).filter((id, index, arr) => arr.indexOf(id) === index) || [];
        const statusIds = basicMembers?.map(m => m.user_status_id).filter((id, index, arr) => arr.indexOf(id) === index) || [];
        const userIds = basicMembers?.map(m => m.user_id) || [];

        const { data: roles } = await supabase
          .from("user_role")
          .select("id, name")
          .in("id", roleIds);

        const { data: statuses } = await supabase
          .from("user_status")
          .select("id, name")
          .in("id", statusIds);


        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds);

        const groupMembers = basicMembers?.map(member => {
          const foundStatus = statuses?.find(s => s.id === member.user_status_id);
          const foundRole = roles?.find(r => r.id === member.role_id);
          const foundProfile = profiles?.find(p => p.id === member.user_id);
          
          
          return {
            user_id: member.user_id,
            score: member.score,
            joined_at: member.joined_at,
            last_active_at: member.last_active_at,
            user_role: foundRole,
            user_status: foundStatus,
            profiles: foundProfile
          };
        }) || [];

        const membersError = basicError;

        if (membersError) {
          console.error(`Error getting members for group ${group.id}:`, membersError);
          return {
            group_id: group.id,
            group_name: group.name,
            score: group.score,
            members: []
          };
        }

        const members = groupMembers?.map(member => ({
          user_id: member.user_id,
          display_name: member.profiles?.display_name || 'Unknown',
          role_name: member.user_role?.name || 'Unknown',
          score: member.score,
          joined_at: member.joined_at,
          last_active_at: member.last_active_at,
          status: member.user_status?.name || 'Unknown'
        })) || [];


        return {
          group_id: group.id,
          group_name: group.name,
          score: group.score,
          created_at: group.created_at,
          last_active_at: group.last_active_at,
          members: members
        };
      })
    );

    return new Response(
      JSON.stringify({ data: groupsWithMembers }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});