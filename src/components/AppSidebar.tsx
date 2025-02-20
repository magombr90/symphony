
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
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          <path
            d="M40 20h120"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <text
            x="100"
            y="25"
            textAnchor="middle"
            className="fill-primary"
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "24px",
              fontWeight: "300",
              letterSpacing: "0.1em",
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
      </SidebarContent>
    </Sidebar>
  );
}
