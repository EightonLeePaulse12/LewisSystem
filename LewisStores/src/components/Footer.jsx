// src/components/Footer.jsx
import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="px-4 py-8 text-black bg-white sm:px-6 md:py-10 lg:px-8" id= 'homePageBottomFooter'>
      <div className="grid grid-cols-1 gap-8 mx-auto sm:grid-cols-2 md:grid-cols-4 md:gap-8 max-w-7xl">
        <div>
          <h4 className="text-lg font-bold text-red-600">LEWIS</h4>
          <p className="mt-2 text-sm text-gray-600">Africa's largest furniture retailer since 1934.</p>
          <div className="flex mt-4 space-x-4">
            <a href="https://facebook.com" className="text-gray-600 hover:text-red-600" id= 'facebokIcon'>
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" className="text-gray-600 hover:text-red-600" id= 'twitterIcon'>
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" className="text-gray-600 hover:text-red-600" id= 'instagramIcon'>
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-lg font-bold text-red-600">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">All Products</Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">Lounge Suites</Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">Bedroom Suites</Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">Appliances</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-lg font-bold text-red-600">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">Delivery Information</Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">Returns Policy</Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">FAQ</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-lg font-bold text-red-600">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-600" />
              <a href="mailto:support@lewisstores.com" className="text-gray-600 hover:text-red-600">support@lewisstores.com</a>
            </li>
            <li className="text-gray-600">0800 111 123</li>
            <li>
              <Link to="#" className="text-gray-600 transition-colors hover:text-red-600">Find Nearest Store</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-6 mt-8 border-t border-gray-200">
        <p className="text-sm text-center text-gray-500">
          © 2025 Lewis Stores. All rights reserved.
        </p>
      </div>
    </footer>
  );
}