
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import AppSidebar from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "./ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Outlet } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message || "Por favor, tente novamente.",
      });
    }
  };

  // Se não estiver carregando e não houver usuário, redireciona para /auth
  if (!isLoading && !currentUser) {
    navigate("/auth");
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {!isMobile && <AppSidebar />}
          
          {isMobile && (
            <>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-[280px]">
                  <AppSidebar />
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          )}

          <main className="flex-1 overflow-hidden">
            <div className="container mx-auto p-6">
              <div className="flex justify-end items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                <ThemeToggle />
              </div>
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
