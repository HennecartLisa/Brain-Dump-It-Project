import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { IMPORTANCE_TYPE } from "../../../src/types/db-types/importanceType.ts";
import { API_ERROR_MESSAGES, API_SUCCESS_MESSAGES } from "../../../src/constants/apiMessages.ts";

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

  const { 
    list_id, 
    name, 
    importance
  }: {
    list_id: string;
    name?: string;
    importance?: typeof IMPORTANCE_TYPE;
  } = await req.json();

  if (!list_id || typeof list_id !== "string") {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.INVALID_INPUT }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const updateFields = { name, importance };
  const hasFieldsToUpdate = Object.values(updateFields).some(value => value !== undefined);
  
  if (!hasFieldsToUpdate) {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.INVALID_INPUT }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (name !== undefined && typeof name !== "string") {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.INVALID_INPUT }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (importance !== undefined && typeof importance !== "string") {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.INVALID_INPUT }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.replace("Bearer ", "");

  if (!jwt) {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.FAILED_TO_AUTHENTICATE }), {
      status: 401,
      headers: corsHeaders
    });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(jwt);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.FAILED_TO_AUTHENTICATE }), {
      status: 401,
      headers: corsHeaders
    });
  }

  let importance_id: number | undefined;

  if (importance !== undefined) {
    const validImportanceValues = Object.values(IMPORTANCE_TYPE);
    if (!validImportanceValues.includes(importance as typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE])) {
      return new Response(JSON.stringify({ 
        error: `Invalid importance. Must be one of: ${validImportanceValues.join(", ")}` 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { data: importanceData, error: importanceError } = await supabase
      .from("importance")
      .select("id")
      .eq("name", importance)
      .single();

    if (importanceError || !importanceData) {
      return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.INVALID_INPUT }), {
        status: 400,
        headers: corsHeaders
      });
    }
    importance_id = importanceData.id;
  }

  const { data: existingList, error: listCheckError } = await supabase
    .from("list")
    .select("id, created_by")
    .eq("id", list_id)
    .single();

  if (listCheckError || !existingList) {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.FAILED_TO_MODIFY_LIST }), {
      status: 404,
      headers: corsHeaders
    });
  }

  const updateObj: {
    name?: string;
    importance_id?: number;
    last_active_at?: string;
  } = {};
  
  if (name !== undefined) updateObj.name = name;
  if (importance_id !== undefined) updateObj.importance_id = importance_id;
  updateObj.last_active_at = new Date().toISOString();

  const { data: updatedList, error: updateError } = await supabase
    .from("list")
    .update(updateObj)
    .eq("id", list_id)
    .select()
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: API_ERROR_MESSAGES.FAILED_TO_MODIFY_LIST }), {
      status: 500,
      headers: corsHeaders
    });
  }

  return new Response(JSON.stringify({ 
    message: API_SUCCESS_MESSAGES.LIST_CREATED,
    list: updatedList 
  }), {
    status: 200,
    headers: corsHeaders
  });
});