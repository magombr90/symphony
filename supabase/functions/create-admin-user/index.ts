
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Obter as credenciais do Supabase das variáveis de ambiente
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Faltam variáveis de ambiente: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
    }

    // Criar cliente do Supabase com a chave de serviço (service role)
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Obter dados do corpo da requisição
    const { name, email, password, role } = await req.json();
    
    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Criar o usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (authError) {
      throw new Error(`Erro ao criar usuário de autenticação: ${authError.message}`);
    }

    // Criar o perfil do usuário na tabela system_users
    const { data: userData, error: insertError } = await supabase
      .from("system_users")
      .insert({
        id: authData.user.id,
        name,
        email,
        password_hash: "", // Não precisamos salvar a senha aqui, já está em auth.users
        role,
        active: true
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erro ao criar perfil de usuário: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Usuário administrador criado com sucesso",
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        }
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Erro na função:", error.message);
    
    return new Response(
      JSON.stringify({ error: `Erro ao criar usuário: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
