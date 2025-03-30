
import { supabase } from "@/integrations/supabase/client";

/**
 * This utility script creates a test admin user
 * Run this script once from the browser console on the login page
 */
export async function createTestUser() {
  try {
    // 1. First sign up the user through Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'teste@exemplo.com',
      password: 'senha123',
      options: {
        data: {
          name: 'Usuário de Teste'
        }
      }
    });
    
    if (authError) {
      console.error("Error creating auth user:", authError);
      return;
    }
    
    console.log("Auth user created:", authData);
    
    // 2. Ensure the user has admin role in system_users table
    if (authData.user) {
      const { error: updateError } = await supabase
        .from('system_users')
        .update({ role: 'admin' })
        .eq('id', authData.user.id);
        
      if (updateError) {
        console.error("Error setting admin role:", updateError);
        return;
      }
      
      console.log("User successfully created with admin role!");
      console.log("Email: teste@exemplo.com");
      console.log("Password: senha123");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Export a function that can be called from the browser console
(window as any).createTestUser = createTestUser;
