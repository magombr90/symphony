
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to get current user ID, with fallback to Supabase auth
 * Used by various ticket action functions to ensure consistent auth handling
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    // First try to get from React Query cache - done in the hook that calls this
    
    // Check session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
    } else if (sessionData.session?.user.id) {
      console.log("Using session user ID:", sessionData.session.user.id);
      return sessionData.session.user.id;
    }
    
    // If session doesn't work, try getUser
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error fetching auth user:", error);
      
      // If the error is related to missing session, check if there's a token in localStorage
      if (error.message === "Auth session missing!") {
        const localSession = localStorage.getItem('supabase.auth.token');
        if (localSession) {
          console.log("Found session in localStorage, will attempt to refresh");
          try {
            const { data: refreshData } = await supabase.auth.refreshSession();
            if (refreshData.session?.user.id) {
              console.log("Session refreshed, using user ID:", refreshData.session.user.id);
              return refreshData.session.user.id;
            }
          } catch (refreshError) {
            console.error("Error refreshing session:", refreshError);
          }
        }
      }
      
      return null;
    }
    
    if (data?.user?.id) {
      console.log("Using Supabase auth user ID:", data.user.id);
      return data.user.id;
    }
    
    console.error("No user found in Supabase auth");
    return null;
  } catch (error) {
    console.error("Unexpected error in getCurrentUserId:", error);
    return null;
  }
};
