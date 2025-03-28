
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("system_users")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Current user data:", data); 
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Verify explicitly if the user has admin role, handling undefined case
  const isAdmin = Boolean(currentUser?.role === "admin");
  console.log("Is admin:", isAdmin, "User role:", currentUser?.role); 

  return {
    currentUser,
    isAdmin,
  };
}
