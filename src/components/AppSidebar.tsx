
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
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Símbolo S robótico */}
          <g transform="translate(20, 15)" filter="url(#glow)">
            {/* Camada base do S */}
            <path
              d="M25 20 
                 h 20 
                 v 5 
                 h -15 
                 v 15 
                 h 15 
                 v 5 
                 h -20 
                 v -5 
                 h 15 
                 v -15 
                 h -15 
                 z"
              fill="url(#symbolGradient)"
              opacity="0.2"
            />
            
            {/* Linhas geométricas do S */}
            <path
              d="M20 20 
                 h 25 
                 v 10 
                 h -20 
                 v 10 
                 h 20 
                 v 10 
                 h -25"
              stroke="url(#symbolGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
            
            {/* Detalhes tecnológicos */}
            <path
              d="M15 15 v 5 
                 M15 35 v 5
                 M45 15 v 5
                 M45 35 v 5"
              stroke="url(#symbolGradient)"
              strokeWidth="2"
              opacity="0.6"
            />
            
            {/* Pontos decorativos */}
            <circle cx="15" cy="15" r="2" fill="url(#symbolGradient)" />
            <circle cx="45" cy="15" r="2" fill="url(#symbolGradient)" />
            <circle cx="15" cy="40" r="2" fill="url(#symbolGradient)" />
            <circle cx="45" cy="40" r="2" fill="url(#symbolGradient)" />
          </g>
          
          {/* Nome Symphony */}
          <text
            x="160"
            y="50"
            textAnchor="middle"
            fill="url(#symbolGradient)"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "32px",
              fontWeight: "700",
              letterSpacing: "0.2em",
              filter: "url(#glow)",
              textTransform: "uppercase"
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
