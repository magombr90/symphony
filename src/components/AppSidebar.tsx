
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
  const { isAdmin, currentUser } = useAuth();

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
    ...(isAdmin 
      ? [
          {
            title: "Usuários",
            icon: User,
            path: "/system-users",
          }
        ] 
      : []
    ),
  ];

  return (
    <Sidebar className={isMobile ? "w-full h-full" : ""}>
      <div className="p-6">
        <svg
          viewBox="0 0 240 60"
          className="w-full h-auto"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#9b87f5" }} />
              <stop offset="100%" style={{ stopColor: "#9b87f5", stopOpacity: 0.7 }} />
            </linearGradient>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#9b87f5", stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: "#9b87f5", stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          
          {/* Símbolo musical estilizado */}
          <path
            d="M40 30 
               C 45 25, 50 15, 50 10
               C 50 5, 45 5, 45 10
               C 45 15, 45 25, 45 30
               L 45 40
               C 45 45, 35 45, 35 40
               C 35 35, 40 35, 45 37"
            stroke="url(#waveGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Ondas sonoras estilizadas */}
          <path
            d="M60 30 Q 70 30, 80 25 Q 90 20, 100 25 Q 110 30, 120 25"
            stroke="url(#waveGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Nome Symphony */}
          <text
            x="140"
            y="35"
            textAnchor="middle"
            className="fill-primary"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "32px",
              letterSpacing: "0.05em",
            }}
          >
            Symphony
          </text>
        </svg>
      </div>
      
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
