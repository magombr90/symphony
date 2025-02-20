
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
          viewBox="0 0 280 80"
          className="w-full h-auto"
        >
          <defs>
            <linearGradient id="symbolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#9b87f5" }} />
              <stop offset="100%" style={{ stopColor: "#7c64f3" }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Símbolo musical complexo */}
          <g transform="translate(30, 15)" filter="url(#glow)">
            {/* Base da clave de sol */}
            <path
              d="M20 45
                 C 20 35, 40 35, 40 25
                 C 40 15, 20 15, 20 25
                 C 20 35, 35 40, 35 50
                 C 35 60, 15 60, 15 50
                 C 15 45, 20 45, 25 47"
              stroke="url(#symbolGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Ondas musicais decorativas */}
            <path
              d="M45 30
                 Q 55 25, 65 30
                 Q 75 35, 85 30
                 Q 95 25, 105 30"
              stroke="url(#symbolGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
            
            <path
              d="M45 40
                 Q 55 35, 65 40
                 Q 75 45, 85 40
                 Q 95 35, 105 40"
              stroke="url(#symbolGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />
          </g>
          
          {/* Nome Symphony com estilo moderno */}
          <text
            x="160"
            y="50"
            textAnchor="middle"
            fill="url(#symbolGradient)"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "42px",
              letterSpacing: "0.02em",
              filter: "url(#glow)",
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
