import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { IMPORTANCE_TYPE } from "../../../src/types/db-types/importanceType.ts";
import { TASK_EFFORT_TYPE } from "../../../src/types/db-types/taskEffortType.ts";

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
    task_id, 
    name, 
    importance, 
    task_effort, 
    deadline, 
    repeat, 
    last_active_at 
  }: {
    task_id: string;
    name?: string;
    importance?: typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE];
    task_effort?: typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE];
    deadline?: string;
    repeat?: string;
    last_active_at?: string;
  } = await req.json();

  if (!task_id || typeof task_id !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'task_id'" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const updateFields = { name, importance, task_effort, deadline, repeat, last_active_at };
  const hasFieldsToUpdate = Object.values(updateFields).some(value => value !== undefined);
  
  if (!hasFieldsToUpdate) {
    return new Response(JSON.stringify({ error: "At least one field to update must be provided" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (name !== undefined && typeof name !== "string") {
    return new Response(JSON.stringify({ error: "Invalid 'name' - must be a string" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (importance !== undefined && typeof importance !== "string") {
    return new Response(JSON.stringify({ error: "Invalid 'importance' - must be a string" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (task_effort !== undefined && typeof task_effort !== "string") {
    return new Response(JSON.stringify({ error: "Invalid 'task_effort' - must be a string" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (deadline !== undefined && typeof deadline !== "string") {
    return new Response(JSON.stringify({ error: "Invalid 'deadline' - must be a string (YYYY-MM-DD format)" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (repeat !== undefined && typeof repeat !== "string") {
    return new Response(JSON.stringify({ error: "Invalid 'repeat' - must be a string" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (last_active_at !== undefined && typeof last_active_at !== "string") {
    return new Response(JSON.stringify({ error: "Invalid 'last_active_at' - must be a string (ISO timestamp)" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get auth token
  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.replace("Bearer ", "");

  if (!jwt) {
    return new Response(JSON.stringify({ error: "Missing auth token" }), {
      status: 401,
      headers: corsHeaders
    });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(jwt);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized or Could not authenticate user" }), {
      status: 401,
      headers: corsHeaders
    });
  }

  // Look up IDs for string values and validate they exist
  let importance_id: number | undefined;
  let task_effort_id: number | undefined;
  let repeat_id: number | undefined;

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
      return new Response(JSON.stringify({ error: "Invalid importance. Importance level does not exist." }), {
        status: 400,
        headers: corsHeaders
      });
    }
    importance_id = importanceData.id;
  }

  if (task_effort !== undefined) {
    const validEffortValues = Object.values(TASK_EFFORT_TYPE);
    if (!validEffortValues.includes(task_effort as typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE])) {
      return new Response(JSON.stringify({ 
        error: `Invalid task_effort. Must be one of: ${validEffortValues.join(", ")}` 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { data: effortData, error: effortError } = await supabase
      .from("task_effort")
      .select("id")
      .eq("label", task_effort)
      .single();

    if (effortError || !effortData) {
      return new Response(JSON.stringify({ error: "Invalid task_effort. Task effort does not exist." }), {
        status: 400,
        headers: corsHeaders
      });
    }
    task_effort_id = effortData.id;
  }

  if (repeat !== undefined) {
    const { data: repeatData, error: repeatError } = await supabase
      .from("repeat")
      .select("id")
      .eq("label", repeat)
      .single();

    if (repeatError || !repeatData) {
      return new Response(JSON.stringify({ error: "Invalid repeat. Repeat configuration does not exist." }), {
        status: 400,
        headers: corsHeaders
      });
    }
    repeat_id = repeatData.id;
  }

  const { data: existingTask, error: taskCheckError } = await supabase
    .from("task")
    .select("id, created_by")
    .eq("id", task_id)
    .single();

  if (taskCheckError || !existingTask) {
    return new Response(JSON.stringify({ error: "Task not found" }), {
      status: 404,
      headers: corsHeaders
    });
  }

  const updateObj: {
    name?: string;
    importance_id?: number;
    task_effort_id?: number;
    deadline?: string;
    repeat_id?: number;
    last_active_at?: string;
  } = {};
  
  if (name !== undefined) updateObj.name = name;
  if (importance_id !== undefined) updateObj.importance_id = importance_id;
  if (task_effort_id !== undefined) updateObj.task_effort_id = task_effort_id;
  if (deadline !== undefined) updateObj.deadline = deadline;
  if (repeat_id !== undefined) updateObj.repeat_id = repeat_id;
  if (last_active_at !== undefined) {
    updateObj.last_active_at = last_active_at;
  } else {
    updateObj.last_active_at = new Date().toISOString();
  }

  const { data: updatedTask, error: updateError } = await supabase
    .from("task")
    .update(updateObj)
    .eq("id", task_id)
    .select()
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
      headers: corsHeaders
    });
  }

  return new Response(JSON.stringify({ 
    message: "Task updated successfully",
    task: updatedTask 
  }), {
    status: 200,
    headers: corsHeaders
  });
});