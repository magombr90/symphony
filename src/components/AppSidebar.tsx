
import { Home, Users, Ticket, LayoutDashboard, Box, User } from "lucide-react";
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
  {
    title: "Usuários",
    icon: User,
    path: "/system-users",
  },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <div className="p-6">
        <svg
          viewBox="0 0 200 40"
          className="w-full h-auto"
          style={{ filter: "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.1))" }}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.7 }} />
            </linearGradient>
          </defs>
          <path
            d="M10 30c2-20 5-25 8-25 4 0 6 5 6 5s2-5 6-5c4 0 6 5 6 5s2-5 6-5c4 0 6 5 6 5s2-5 6-5c4 0 6 5 6 5s2-5 6-5c4 0 6 5 6 5s2-5 6-5c4 0 6 5 6 5s2-5 6-5c3 0 6 5 8 25"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text
            x="100"
            y="35"
            textAnchor="middle"
            className="text-2xl fill-primary"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "28px",
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
      </SidebarContent>
    </Sidebar>
  );
}
