import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Info,
  ShoppingBag,
  LogIn,
  UserPlus,
  Menu,
  Phone,
} from "lucide-react";

export function GuestNavbar() {
  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/public/about", label: "About Us", icon: Info, id: "About Us" },
    { to: "/public/products", label: "Products", icon: ShoppingBag },
    { to: "/public/contact", label: "Contact Us", icon: Phone },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-border/40">
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

          {/* RIGHT: Desktop Buttons */}
          <div className="hidden gap-4 md:flex md:items-center">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                id="loginButton"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>

            <Separator orientation="vertical" className="h-6" />

            <Link to="/register">
              <Button
                size="sm"
                className="gap-2 font-bold text-white bg-red-600 hover:bg-red-700"
                id="registerButton"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Button>
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
                    <div className="space-y-2">
                      <Link to="/login">
                        <Button
                          variant="outline"
                          className="justify-start w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          id="loginButton"
                        >
                          <LogIn className="w-4 h-4" />
                          Login
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button
                          className="justify-start w-full gap-2 font-bold text-white bg-red-600 hover:bg-red-700"
                          id="registerButton"
                        >
                          <UserPlus className="w-4 h-4" />
                          Register
                        </Button>
                      </Link>
                    </div>
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