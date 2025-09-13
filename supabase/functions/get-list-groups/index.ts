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
    const { list_id } = await req.json();
    
    if (!list_id || typeof list_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'list_id'" }), { status: 400, headers: corsHeaders });
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

    const { data: listData, error: listError } = await supabase
      .from("list")
      .select("id")
      .eq("id", list_id)
      .single();
    
    if (listError || !listData) {
      return new Response(JSON.stringify({ error: "List not found" }), { status: 404, headers: corsHeaders });
    }

    const { data: listGroups, error: listGroupsError } = await supabase
      .from("list_group")
      .select(`
        list_id,
        group_id,
        general_status_id
      `)
      .eq("list_id", list_id);

    if (listGroupsError) {
      console.error('Error fetching list groups:', listGroupsError);
      if (listGroupsError.message.includes('relation "list_group" does not exist') || 
          listGroupsError.message.includes('does not exist')) {
        return new Response(JSON.stringify({ 
          success: true, 
          data: [] 
        }), { status: 200, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ error: `Failed to fetch list groups: ${listGroupsError.message}` }), { status: 500, headers: corsHeaders });
    }

    const groupIds = [...new Set((listGroups || []).map((lg: any) => lg.group_id))];
    const statusIds = [...new Set((listGroups || []).map((lg: any) => lg.general_status_id))];

    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("id, name, score")
      .in("id", groupIds);

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
    }

    const { data: statuses, error: statusesError } = await supabase
      .from("general_status")
      .select("id, name")
      .in("id", statusIds);

    if (statusesError) {
      console.error('Error fetching statuses:', statusesError);
    }

    const transformedGroups = await Promise.all(
      (listGroups || []).map(async (lg: any) => {
        const group = groups?.find((g: any) => g.id === lg.group_id);
        const status = statuses?.find((s: any) => s.id === lg.general_status_id);

        const { data: members, error: membersError } = await supabase
          .from("group_member")
          .select(`
            user_id,
            score,
            joined_at,
            last_active_at,
            role_id,
            user_status_id
          `)
          .eq("group_id", lg.group_id);

        if (membersError) {
          console.error(`Error getting members for group ${lg.group_id}:`, membersError);
          return {
            id: `${lg.list_id}-${lg.group_id}`,
            assigned_at: null,
            group: {
              id: lg.group_id,
              name: group?.name || 'Unknown',
              score: group?.score || 0
            },
            status: {
              id: lg.general_status_id,
              name: status?.name || 'Unknown'
            },
            members: []
          };
        }

        const memberIds = (members || []).map((m: any) => m.user_id);
        const roleIds = [...new Set((members || []).map((m: any) => m.role_id))];
        const memberStatusIds = [...new Set((members || []).map((m: any) => m.user_status_id))];

        const [profilesResult, rolesResult, memberStatusesResult] = await Promise.all([
          supabase.from("profiles").select("id, display_name").in("id", memberIds),
          supabase.from("user_role").select("id, name").in("id", roleIds),
          supabase.from("user_status").select("id, name").in("id", memberStatusIds)
        ]);

        const transformedMembers = (members || [])
          .map((member: any) => {
            const profile = profilesResult.data?.find((p: any) => p.id === member.user_id);
            const role = rolesResult.data?.find((r: any) => r.id === member.role_id);
            const memberStatus = memberStatusesResult.data?.find((s: any) => s.id === member.user_status_id);

            return {
              user_id: member.user_id,
              display_name: profile?.display_name || 'Unknown',
              role_name: role?.name || 'Unknown',
              score: member.score,
              joined_at: member.joined_at,
              last_active_at: member.last_active_at,
              status: memberStatus?.name || 'Unknown'
            };
          })
          .filter((member: any) => member.status === 'Accepted');

        return {
          id: `${lg.list_id}-${lg.group_id}`,
          assigned_at: null,
          group: {
            id: lg.group_id,
            name: group?.name || 'Unknown',
            score: group?.score || 0
          },
          status: {
            id: lg.general_status_id,
            name: status?.name || 'Unknown'
          },
          members: transformedMembers
        };
      })
    );

    return new Response(JSON.stringify({ 
      success: true, 
      data: transformedGroups 
    }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});