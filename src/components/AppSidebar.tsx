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
          
          <g transform="translate(30, 15)" filter="url(#glow)">
            <path
              d="M20 20 
                L 40 20
                L 40 35
                L 20 35
                L 20 50
                L 40 50"
              stroke="url(#symbolGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            <path
              d="M45 20 
                L 65 20
                L 65 35
                L 45 35
                L 45 50
                L 65 50"
              stroke="url(#symbolGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3, transform: 'scaleX(-1)' }}
            />
          </g>
          
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
