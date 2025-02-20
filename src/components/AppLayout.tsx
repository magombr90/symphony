
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import AppSidebar from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "./ui/sheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-[1600px]">
              <div className="flex justify-end mb-4">
                <ThemeToggle />
              </div>
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
