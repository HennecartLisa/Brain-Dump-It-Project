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
    const { themeId, typography1, typography2, scaling } = await req.json();

    if (themeId !== undefined && (typeof themeId !== "number" || themeId < 1)) {
      return new Response(
        JSON.stringify({ error: "Theme ID must be a positive number" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (scaling !== undefined && (typeof scaling !== "number" || scaling <= 0)) {
      return new Response(
        JSON.stringify({ error: "Scaling must be a positive number" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: existingComfortMode, error: checkError } = await supabase
      .from("comfort_mode")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return new Response(
        JSON.stringify({ error: checkError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let result;
    if (existingComfortMode) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (themeId !== undefined) updateData.theme_id = themeId;
      if (typography1 !== undefined) updateData.typography_1 = typography1;
      if (typography2 !== undefined) updateData.typography_2 = typography2;
      if (scaling !== undefined) updateData.scaling = scaling;

      const { data, error } = await supabase
        .from("comfort_mode")
        .update(updateData)
        .eq("profile_id", user.id)
        .select(`
          *,
          theme!inner(
            id,
            typography_1,
            typography_2,
            colour_1,
            colour_2,
            colour_3,
            colour_4,
            colour_5,
            colour_6,
            colour_7,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      result = data;
    } else {
      const insertData: any = {
        profile_id: user.id,
        theme_id: themeId || 1,
        typography_1: typography1 || null,
        typography_2: typography2 || null,
        scaling: scaling || 1.0
      };

      const { data, error } = await supabase
        .from("comfort_mode")
        .insert(insertData)
        .select(`
          *,
          theme!inner(
            id,
            typography_1,
            typography_2,
            colour_1,
            colour_2,
            colour_3,
            colour_4,
            colour_5,
            colour_6,
            colour_7,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      result = data;
    }

    return new Response(
      JSON.stringify({ comfort_mode: result }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
