// src/components/NavigationMenus/CustomerNavbar.jsx
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function CustomerNavbar() {
  const { logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 text-white bg-gray-800">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">My Orders</Link>
      </div>
      <div className="flex items-center space-x-4">
        <span>Welcome, Customer</span>
        <Button onClick={logout}>Logout</Button>
      </div>
    </nav>
  );
}