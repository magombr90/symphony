
import { Home, Users, Ticket, LayoutDashboard, Box, User, UserCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

export default function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "Clientes",
      icon: Users,
      path: "/clients",
    },
    {
      title: "Tickets",
      icon: Ticket,
      path: "/tickets",
    },
    {
      title: "Equipamentos",
      icon: Box,
      path: "/equipments",
    },
    ...(currentUser?.role === 'admin' ? [
      {
        title: "Usuários",
        icon: User,
        path: "/system-users",
      }
    ] : []),
  ];

  return (
    <Sidebar className={isMobile ? "w-full h-full" : ""}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    className={location.pathname === item.path ? "bg-accent" : ""}
                    asChild
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Usuário</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={location.pathname === "/profile" ? "bg-accent" : ""}
                  asChild
                >
                  <Link to="/profile" className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5" />
                    <span>{currentUser?.name || "Meu Perfil"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
