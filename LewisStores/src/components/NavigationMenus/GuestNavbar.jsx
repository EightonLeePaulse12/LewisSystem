// src/components/NavigationMenus/GuestNavbar.jsx (updated with /products)
import { Link } from '@tanstack/react-router';

export function GuestNavbar() {
  return (
    <nav className="flex items-center justify-between p-4 text-white bg-gray-800">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold">Home</Link>
        <Link to="/public/about">About Us</Link>
        <Link to="/products">Products</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}