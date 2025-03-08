
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          if (authError.message === "Auth session missing!") {
            // Check if there's a session in localStorage
            const localSession = localStorage.getItem('supabase.auth.token');
            if (localSession) {
              console.log("Found session in localStorage, refreshing...");
              // Try to refresh the session
              const { data } = await supabase.auth.refreshSession();
              if (data.session) {
                console.log("Session refreshed successfully");
              }
            } else {
              console.log("No session found in localStorage");
            }
          }
          return null;
        }

        if (!user) {
          console.log("No authenticated user found");
          return null;
        }

        const { data, error: userError } = await supabase
          .from("system_users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("User data fetch error:", userError);
          return null;
        }

        console.log("Current user data:", data); // Log for debugging
        return data;
      } catch (error) {
        console.error("Unexpected error in useAuth:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2, // Add retry logic
  });

  // Verify explicitly if the user has admin role
  const isAdmin = Boolean(currentUser?.role === "admin");
  console.log("Is admin:", isAdmin, "User role:", currentUser?.role); // Log for debugging

  return {
    currentUser,
    isAdmin,
    isLoading,
    error,
  };
}
