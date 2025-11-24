import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, Info, ShoppingBag, LogIn, UserPlus } from "lucide-react";

export function GuestNavbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-4 bg-white shadow-md sm:px-6 lg:px-8">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-2xl font-bold text-red-600">
          LEWIS
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
            <Home className="w-5 h-5" />
            <span className="hidden font-medium md:inline">Home</span>
          </Link>
          <Link to="/public/about" className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
            <Info className="w-5 h-5" />
            <span className="hidden font-medium md:inline">About Us</span>
          </Link>
          <Link to="/public/products" className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden font-medium md:inline">Products</span>
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/login">
          <Button variant="outline" className="flex items-center text-red-600 border-red-600 hover:bg-red-50">
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button className="flex items-center font-bold text-white bg-red-600 hover:bg-red-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Register
          </Button>
        </Link>
      </div>
    </nav>
  );
}