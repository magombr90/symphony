
import { supabase } from "@/integrations/supabase/client";

/**
 * This utility function sets a password for a specific user
 * Run this script once from the browser console to update the password
 * 
 * @param email - The user's email address 
 * @param newPassword - The new password to set
 */
export async function updateUserPassword(email: string, newPassword: string) {
  try {
    // Check if the user exists in system_users table
    const { data: userData, error: userError } = await supabase
      .from("system_users")
      .select("*")
      .eq("email", email)
      .single();
    
    if (userError) {
      console.error("Error finding user:", userError);
      return { success: false, message: "Usuário não encontrado" };
    }
    
    // Create auth account or update password using admin function
    // Note: In a real production app, this should be done through a secure backend
    // For this demo purpose, we'll use the client-side approach
    const { data, error } = await supabase.auth.admin.updateUserById(
      userData.id,
      { password: newPassword }
    );
    
    if (error) {
      console.error("Error updating password:", error);
      
      // If admin function fails, try creating account
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: newPassword,
      });
      
      if (signUpError) {
        console.error("Error creating user account:", signUpError);
        return { success: false, message: "Não foi possível atualizar a senha" };
      }
    }
    
    console.log("Password updated successfully");
    return { success: true, message: "Senha atualizada com sucesso" };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Ocorreu um erro inesperado" };
  }
}

// Export a function that can be called from the browser console
(window as any).updateUserPassword = (email: string, password: string) => {
  updateUserPassword(email, password)
    .then(result => console.log(result.message));
};
