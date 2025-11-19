import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

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

import {
  LayoutDashboard,
  FileChartLine,
  ClipboardList,
  Settings,
  Boxes,
  Users,
  PackageSearch,
} from "lucide-react";

export function ManageSidebar() {
  const { userRole, logout } = useAuth();

  if (!["Admin", "Manager"].includes(userRole)) return null;

  const items = [
    {
      title: "Dashboard",
      to: "/admin/manage/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "Reports",
      to: "/admin/manage/reports",
      icon: FileChartLine,
      show: true,
    },
    {
      title: "Audit Logs",
      to: "/admin/manage/auditLogs",
      icon: ClipboardList,
      show: true,
    },
    {
      title: "Settings",
      to: "/admin/manage/storeSettings",
      icon: Settings,
      show: true,
    },
    {
      title: "Inventory",
      to: "/admin/manage/inventory",
      icon: Boxes,
      show: true,
    },
    {
      title: "Manage Users",
      to: "/admin/manage/users",
      icon: Users,
      show: userRole === "Admin",
    },
    {
      title: "Manage Orders",
      to: "/manage/orders",
      icon: PackageSearch,
      show: userRole === "Manager",
    },
  ];

  return (
    <Sidebar className="h-screen">
      <SidebarContent>
        {/* GROUP: Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((item) => item.show)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.to} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* BOTTOM USER ACTIONS */}
        <SidebarGroup className="px-2 mt-auto mb-4">
          <SidebarGroupLabel>Account</SidebarGroupLabel>

          <SidebarGroupContent>
            <div className="mb-2 text-sm text-muted-foreground">
              Welcome, {userRole}
            </div>

            <Button onClick={logout} className="w-full">
              Logout
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
