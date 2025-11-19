import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ManageSidebar() {
  const { userRole, logout } = useAuth();
  if (!["Admin", "Manager"].includes(userRole)) return null;

  return (
    <aside className="fixed w-64 h-screen p-4 text-white bg-gray-800">
      <div className="flex flex-col space-y-4">
        <Link to="/manage/dashboard" className="font-bold">
          Dashboard
        </Link>
        <Link to="/manage/reports">Reports</Link>
        <Link to="/manage/auditLogs">Audit Logs</Link>
        <Link to="/manage/storeSettings">Settings</Link>
        <Link to="/manage/inventory">Inventory</Link>
        {userRole === "Admin" && (
          <Link to="/manage/users">Manage Users</Link>
        )}{" "}
        // Add route if needed
        {userRole === "Manager" && (
          <Link to="/manage/orders">Manage Orders</Link>
        )}
      </div>
      <div className="absolute bottom-4">
        <span>Welcome, {userRole}</span>
        <Button onClick={logout} className="mt-2">
          Logout
        </Button>
      </div>
    </aside>
  );
}
