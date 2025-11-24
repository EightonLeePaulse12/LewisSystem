import React, { createContext, useContext, useState } from "react";
import {
  LayoutDashboard,
  FileChartLine,
  ClipboardList,
  Settings,
  Boxes,
  Users,
  PackageSearch,
  LogOut,
  User,
  ShieldCheck,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

// --- MOCKS FOR PREVIEW (Replace these with your actual imports in production) ---

// Mock Router
const useLocation = () => ({ pathname: "/admin/manage/dashboard" });


// Mock Auth Hook
const useAuth = () => ({
  userRole: "Admin",
  logout: () => console.log("Logging out..."),
});

// Mock UI Components (Simplified versions of Shadcn/your components)
const Badge = ({ children, className }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
  >
    {children}
  </span>
);

const TooltipProvider = ({ children }) => <>{children}</>;
const Tooltip = ({ children }) => (
  <div className="group relative">{children}</div>
);
const TooltipTrigger = ({ children }) => <>{children}</>;
const TooltipContent = ({ children, className }) => (
  <div
    className={`absolute left-full top-1/2 ml-2 -translate-y-1/2 z-50 overflow-hidden rounded-md border bg-slate-900 px-3 py-1.5 text-xs text-slate-50 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 hidden group-hover:block whitespace-nowrap ${className}`}
  >
    {children}
  </div>
);

// Mock Sidebar Context & Components
const SidebarContext = createContext({
  state: "expanded",
  toggleSidebar: () => {},
});

const SidebarProvider = ({ children, defaultOpen = true }) => {
  const [state, setState] = useState(defaultOpen ? "expanded" : "collapsed");
  const toggleSidebar = () =>
    setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
  return (
    <SidebarContext.Provider value={{ state, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

const useSidebar = () => useContext(SidebarContext);

const Sidebar = ({ className, children, collapsible }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div
      data-state={state}
      data-collapsible={collapsible}
      className={`group/sidebar flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[80px]" : "w-[280px]"
      } ${className}`}
    >
      {children}
    </div>
  );
};

const SidebarHeader = ({ className, children }) => (
  <div className={className}>{children}</div>
);
const SidebarContent = ({ className, children }) => (
  <div className={`flex-1 overflow-auto ${className}`}>{children}</div>
);
const SidebarFooter = ({ className, children }) => (
  <div className={className}>{children}</div>
);
const SidebarGroup = ({ className, children }) => (
  <div className={className}>{children}</div>
);
const SidebarGroupLabel = ({ className, children }) => (
  <div className={className}>{children}</div>
);
const SidebarGroupContent = ({ children }) => <div>{children}</div>;
const SidebarMenu = ({ className, children }) => (
  <ul className={className}>{children}</ul>
);
const SidebarMenuItem = ({ children }) => <li>{children}</li>;
const SidebarMenuButton = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

const SidebarTrigger = ({ className }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button onClick={toggleSidebar} className={className}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
};

// --- MAIN COMPONENT IMPLEMENTATION ---

// Menu items configuration
const menuItems = [
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
    title: "Inventory",
    to: "/admin/manage/inventory",
    icon: Boxes,
    show: true,
  },
  {
    title: "Manage Users",
    to: "/admin/manage/users",
    icon: Users,
    show: (userRole) => userRole === "Admin",
  },
  {
    title: "Manage Orders",
    to: "/manage/orders",
    icon: PackageSearch,
    show: (userRole) => userRole === "Manager",
  },
];

const ManageSidebar = React.memo(() => {
  const { userRole, logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Filter items based on role
  const visibleItems = menuItems.filter((item) =>
    typeof item.show === "function" ? item.show(userRole) : item.show
  );

  // Early return if no access
  if (!["Admin", "Manager"].includes(userRole)) return null;

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-800 bg-slate-900 text-slate-300 shadow-2xl font-sans sticky top-0 left-0"
      >
        {/* --- Header --- */}
        <SidebarHeader className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 bg-slate-950/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30 ring-1 ring-white/10">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div
              className={`flex flex-col fade-in transition-all duration-300 ${
                isCollapsed ? "hidden w-0 opacity-0" : "flex w-auto opacity-100"
              }`}
            >
              <span className="font-bold text-white tracking-tight text-lg leading-none">
                Lewis Admin
              </span>
              <span className="text-[10px] uppercase tracking-wider text-red-500 font-bold mt-1">
                Est. 1906
              </span>
            </div>
          </div>
          {/* Collapse Trigger - Always visible for easy access */}
          <SidebarTrigger className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors" />
        </SidebarHeader>

        <SidebarContent className="flex flex-col h-full bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
          {/* --- Navigation --- */}
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel
              className={`text-xs font-bold tracking-widest text-slate-500 uppercase px-6 mb-3 transition-opacity duration-300 ${
                isCollapsed ? "opacity-0 hidden" : "opacity-100 block"
              }`}
            >
              Management
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-2 px-3">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`
                              relative flex items-center h-12 rounded-xl transition-all duration-300 cursor-pointer group
                              ${isCollapsed ? "justify-center px-0" : "px-4"}
                              ${
                                isActive
                                  ? "bg-red-700 text-white shadow-lg shadow-red-900/40"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                              }
                            `}
                          >
                            <Link
                              to={item.to}
                              className="flex items-center gap-3 w-full"
                            >
                              <item.icon
                                className={`h-5 w-5 flex-shrink-0 transition-colors ${
                                  isActive
                                    ? "text-white"
                                    : "text-slate-400 group-hover:text-red-400"
                                }`}
                              />
                              <span
                                className={`whitespace-nowrap font-medium transition-all duration-300 ${
                                  isCollapsed
                                    ? "w-0 opacity-0 overflow-hidden"
                                    : "w-auto opacity-100"
                                }`}
                              >
                                {item.title}
                              </span>

                              {/* Active Indicator Strip (Visible only when active) */}
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white/20" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent
                            side="right"
                            className="bg-slate-800 text-white border-slate-700 font-medium z-50 ml-2"
                          >
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* --- Footer / User --- */}
        <SidebarFooter className="border-t border-slate-800 bg-slate-950/50 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <div
                className={`flex items-center gap-3 mb-4 transition-all ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isCollapsed
                      ? "w-0 opacity-0 hidden"
                      : "w-auto opacity-100 block"
                  }`}
                >
                  <p className="text-sm font-bold text-white truncate">
                    Admin User
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 h-5 mt-0.5 border-red-900/40 bg-red-950/30 text-red-400"
                  >
                    {userRole}
                  </Badge>
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={logout}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 
                      hover:text-white hover:bg-red-600 rounded-lg transition-all duration-300 border border-transparent hover:border-red-500/50
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className={`${isCollapsed ? "hidden" : "block"}`}>
                      Sign Out
                    </span>
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent
                    side="right"
                    className="bg-red-700 text-white border-red-600"
                  >
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
});

ManageSidebar.displayName = "ManageSidebar";

// Wrapper to provide context for the Preview
export default function ManageSidebarPreview() {
  return (
    <SidebarProvider defaultOpen={true}>
      <ManageSidebar />
    </SidebarProvider>
  );
}