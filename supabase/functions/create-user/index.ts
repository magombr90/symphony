
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://zooxsmqfzpxedecpukjq.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY não está configurada');
      return new Response(
        JSON.stringify({ 
          error: "SUPABASE_SERVICE_ROLE_KEY não está configurada nas variáveis de ambiente da função. Por favor, configure-a nas configurações de Edge Functions do Supabase." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Parse the request body
    const { email, password, name, role } = await req.json()
    
    // Validate input
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and name are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Creating user: ${email}, name: ${name}, role: ${role || 'user'}`)
    
    // Check if the user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    
    if (existingUser) {
      console.log('User already exists, updating user in system_users table')
      
      // Update the system_users table if needed
      const { data: systemUser, error: systemError } = await supabaseAdmin
        .from('system_users')
        .upsert({
          id: existingUser.id,
          email,
          name,
          role: role || 'user',
          password_hash: 'password-is-in-auth-system',
          active: true,
        })
        .select()
        .single()
        
      if (systemError) {
        console.error('Error updating system user:', systemError)
        return new Response(
          JSON.stringify({ error: systemError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          message: 'User already exists, updated in system_users table', 
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name,
            role: role || 'user'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create the auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Auth user created:', authUser.user.id)

    // Then create the system user using the same UUID
    const { data: systemUser, error: systemError } = await supabaseAdmin
      .from('system_users')
      .insert({
        id: authUser.user.id,
        email,
        name,
        role: role || 'user',
        password_hash: 'password-is-in-auth-system', // We don't store actual passwords here
        active: true,
      })
      .select()
      .single()

    if (systemError) {
      console.error('Error creating system user:', systemError)
      
      // Try to clean up the auth user if system user creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return new Response(
        JSON.stringify({ error: systemError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('System user created:', systemUser)

    return new Response(
      JSON.stringify({ 
        message: 'User created successfully', 
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          name,
          role: role || 'user'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
