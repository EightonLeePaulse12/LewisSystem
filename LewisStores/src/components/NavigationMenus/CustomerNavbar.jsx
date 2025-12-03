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
  Phone,
  User,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
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

  const profilePic = useMemo(
    () => userProfile?.profilePicture || "",
    [userProfile]
  );

  const navItems = [
    { to: "/public/home", label: "Home", icon: Home },
    { to: "/public/about", label: "About Us", icon: Info, id: "About Us"},
    { to: "/public/products", label: "Products", icon: ShoppingBag },
    { to: "/customer/cart", label: "Cart", icon: ShoppingCart },
    { to: "/customer/orders/manage", label: "My Orders", icon: Package , id: "myOrders"},
    { to: "/public/contact", label: "Contact Us", icon: Phone },
  ];

  return (
    // Changed: Added sticky positioning, backdrop blur, and a bottom border instead of shadow
    // This creates a modern "glass" effect that sits nicely on top of your dark hero section.
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-border/40">
      {/* Changed: Added a max-width container to center content on large screens */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-black tracking-tight text-red-600 transition-opacity hover:opacity-90"
            >
              LEWIS
            </Link>

            {/* Desktop Menu */}
            {/* Changed: Increased spacing, refined font size/weight, added smooth transitions */}
            <div className="items-center hidden space-x-6 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center space-x-2 text-sm font-medium transition-colors group text-muted-foreground hover:text-red-600"
                  >
                    <Icon className="w-4 h-4 text-gray-400 transition-colors group-hover:text-red-600" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Desktop Logout & Profile */}
          <div className="hidden gap-4 md:flex md:items-center">
            {/* Changed: "Ghost" variant. It shouldn't be a solid red block. 
                It's now subtle until you hover over it. */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Link to={"/customer/profile"}>
              {/* Changed: Reduced size to w-9 h-9 (36px) and added a subtle ring for definition */}
              <Avatar className="transition-transform border border-gray-200 shadow-sm cursor-pointer w-9 h-9 hover:scale-105 ring-offset-background">
                <AvatarImage
                  src={profilePic}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="text-sm font-bold text-red-600 bg-red-50">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          {/* MOBILE MENU TRIGGER */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2">
                  <Menu className="w-6 h-6 text-gray-700" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="px-2 py-4">
                    <h2 className="mb-6 text-2xl font-black tracking-tight text-red-600">
                      LEWIS
                    </h2>

                    <div className="flex flex-col space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600"
                          >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="px-2 py-6 mt-auto">
                    <Separator className="mb-4" />
                    <div className="flex items-center justify-between px-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border">
                          <AvatarImage src={profilePic} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium text-gray-900">
                          My Profile
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
