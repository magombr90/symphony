
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        // First try to get the user from getUser API
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          if (authError.message === "Auth session missing!") {
            // Try to get and refresh session
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session) {
                console.log("Found active session, refreshing...");
                const { data } = await supabase.auth.refreshSession();
                if (data.session) {
                  console.log("Session refreshed successfully");
                  // Use the refreshed user
                  return fetchUserData(data.session.user.id);
                }
              } else {
                // Check if there's a session in localStorage
                const localSession = localStorage.getItem('supabase.auth.token');
                if (localSession) {
                  console.log("Found session in localStorage, attempting refresh...");
                  const { data } = await supabase.auth.refreshSession();
                  if (data.session) {
                    console.log("Session refreshed successfully from localStorage token");
                    return fetchUserData(data.session.user.id);
                  }
                } else {
                  console.log("No session found in localStorage");
                }
              }
            } catch (refreshError) {
              console.error("Error during session refresh:", refreshError);
            }
          }
          return null;
        }

        if (!user) {
          console.log("No authenticated user found");
          return null;
        }

        return fetchUserData(user.id);
      } catch (error) {
        console.error("Unexpected error in useAuth:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2, // Add retry logic
  });

  // Helper function to fetch user data from the database
  async function fetchUserData(userId: string) {
    const { data, error: userError } = await supabase
      .from("system_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("User data fetch error:", userError);
      return null;
    }

    console.log("Current user data:", data);
    return data;
  }

  // Verify explicitly if the user has admin role
  const isAdmin = Boolean(currentUser?.role === "admin");
  console.log("Is admin:", isAdmin, "User role:", currentUser?.role);

  return {
    currentUser,
    isAdmin,
    isLoading,
    error,
  };
}
