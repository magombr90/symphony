
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

    // Primeiro, verificar se o usuário já existe na tabela system_users
    const { data: existingUser, error: queryError } = await supabase
      .from("system_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (queryError) {
      throw new Error(`Erro ao verificar usuário existente: ${queryError.message}`);
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Usuário com este e-mail já existe" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Inserir diretamente na tabela system_users
    const { data: userData, error: insertError } = await supabase
      .from("system_users")
      .insert({
        name,
        email,
        password_hash: password, // O trigger vai lidar com a criptografia
        role,
        active: true
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erro ao criar usuário: ${insertError.message}`);
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
