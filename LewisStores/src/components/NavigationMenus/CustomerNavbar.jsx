import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Info,
  ShoppingBag,
  ShoppingCart,
  Package,
  LogOut,
  Menu,
} from "lucide-react";
import { Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { User } from "lucide-react";
import { GetProfile } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function CustomerNavbar() {
  const { logout } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: GetProfile,
    refetchOnWindowFocus: false,
  });

  const profilePic = useMemo(() => userProfile?.profilePicture || "", [userProfile]);

  const navItems = [
    { to: "/public/home", label: "Home", icon: Home },
    { to: "/public/about", label: "About Us", icon: Info },
    { to: "/public/products", label: "Products", icon: ShoppingBag },
    { to: "/customer/cart", label: "Cart", icon: ShoppingCart },
    { to: "/customer/orders/manage", label: "My Orders", icon: Package },
    { to: "/public/contact", label: "Contact Us", icon: Phone },
  ];

  return (
    <nav className="flex items-center justify-between px-4 py-4 bg-white shadow-md sm:px-6 lg:px-8">
      {/* LEFT: Logo + Desktop Nav */}
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-2xl font-bold text-red-600">
          LEWIS
        </Link>

        {/* Desktop Menu */}
        <div className="hidden space-x-6 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Desktop Logout */}
      <div className="hidden md:flex md:items-center md:justify-center">
        <Button
          className="flex items-center mr-4 font-bold text-white bg-red-600 hover:bg-red-700"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
        <Link to={"/customer/profile"}>
          <Avatar className="w-12 h-12 border-4 shadow-sm border-muted hover:opacity-75">
            <AvatarImage
              src={profilePic}
              className="w-full h-full"
            />
            <AvatarFallback className="text-4xl">
              <User />
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* MOBILE MENU */}
      <div className="flex md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-4">
            <h2 className="mb-4 text-xl font-bold text-red-600">LEWIS</h2>

            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center p-2 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Separator className="my-4" />

            <Button
              className="w-full font-bold text-white bg-red-600 hover:bg-red-700"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
