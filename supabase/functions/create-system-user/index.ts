
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

interface RequestBody {
  user_name: string;
  user_email: string;
  user_password: string;
  user_role: string;
  user_active: boolean;
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const body: RequestBody = await req.json()

    // Validate required fields
    if (!body.user_name || !body.user_email || !body.user_password) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters" 
        }),
        { 
          status: 400, 
          headers: corsHeaders 
        }
      )
    }

    // Create user in auth.users
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email: body.user_email,
      password: body.user_password,
      email_confirm: true,
      user_metadata: {
        name: body.user_name
      }
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Insert user in system_users table
    const { error: dbError } = await supabase
      .from("system_users")
      .insert({
        id: userData.user.id,
        name: body.user_name,
        email: body.user_email,
        role: body.user_role,
        active: body.user_active
      })

    if (dbError) {
      console.error("Error creating system user:", dbError)
      // Attempt to roll back the auth user creation
      await supabase.auth.admin.deleteUser(userData.user.id)
      
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { status: 400, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userData.user.id 
      }),
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error("Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})
