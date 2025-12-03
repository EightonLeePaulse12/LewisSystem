import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Phone,
  Truck,
  ShieldCheck,
  CreditCard,
  Tag,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900">
      {/* --- Top Utility Bar --- */}
      {/* <div className="px-4 py-2 text-xs text-white bg-red-700 md:px-8">
        <div className="container flex flex-col items-center justify-between gap-2 mx-auto md:flex-row">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> 0800 111 123
            </span>
            <span className="hidden text-red-200 md:inline">|</span>
            <span>Store Locator</span>
          </div>
          <div className="font-medium tracking-wide text-center">
            MASSIVE SALE! Save up to{" "}
            <span className="font-bold text-yellow-300">50%</span> on Select
            Items
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/customer/orders"
              className="transition-colors hover:text-red-100"
            >
              Track Order
            </Link>
            <span className="hidden text-red-200 md:inline">|</span>
            <Link
              to="/contact"
              className="transition-colors hover:text-red-100"
            >
              Help
            </Link>
          </div>
        </div>
      </div> */}

      {/* --- Main Navigation --- */}
      {/* <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container px-4 py-4 mx-auto md:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Trigger */}
      {/* <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600"
            > */}
      {/* <Menu className="w-6 h-6" />
            </Button>  */}

      {/* Logo */}
      {/* <Link to="/" className="flex-shrink-0">
              <h1 className="text-3xl font-extrabold tracking-tighter text-red-700">
                LEWIS
                <span className="ml-1 text-base font-normal tracking-normal text-slate-900">
                  Home
                </span>
              </h1>
            </Link>

            {/* Search Bar (Hidden on small mobile) */}
      {/* <div className="relative flex-1 hidden max-w-xl mx-8 md:flex">
              <Input
                type="search"
                placeholder="Search for sofas, beds, appliances..."
                className="w-full pl-4 pr-10 transition-all rounded-full bg-slate-50 border-slate-200 focus:bg-white"
              />
              <Button
                size="icon"
                className="absolute top-0 right-0 w-10 h-10 text-white bg-red-600 rounded-full hover:bg-red-700"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div> */}

      {/* Icons Actions */}
      {/* <div className="flex items-center gap-2 md:gap-4">
              <Link to="/auth/login">
                <Button
                  variant="ghost"
                  className="items-center hidden gap-2 md:flex text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Account</span>
                </Button>
              </Link>

              <Link to="/customer/cart">
                <Button
                  variant="outline"
                  className="relative w-10 h-10 rounded-full border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 md:w-auto md:h-10 md:px-4"
                >
                  <ShoppingCart className="w-5 h-5 md:mr-2" />
                  <span className="hidden font-medium md:inline">Cart</span>
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white rounded-full text-[10px]">
                    2
                  </Badge>
                </Button>
              </Link>
            </div>
          </div> */}
      {/* // </div>  */}

      {/* <nav className="hidden bg-white border-t lg:block border-gray-50">
          <div className="container px-8 mx-auto">
            <ul className="flex items-center justify-center gap-8 py-3 text-sm font-medium text-slate-600">
              <li>
                <Link
                  to="/products"
                  className="transition-colors hover:text-red-600"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/lounge"
                  className="transition-colors hover:text-red-600"
                >
                  Lounge
                </Link>
              </li>
              <li>
                <Link
                  to="/bedroom"
                  className="transition-colors hover:text-red-600"
                >
                  Bedroom
                </Link>
              </li>
              <li>
                <Link
                  to="/kitchen"
                  className="transition-colors hover:text-red-600"
                >
                  Kitchen
                </Link>
              </li>
              <li>
                <Link
                  to="/appliances"
                  className="transition-colors hover:text-red-600"
                >
                  Appliances
                </Link>
              </li>
              <li>
                <Link
                  to="/specials"
                  className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700"
                >
                  <Tag className="w-3 h-3" /> Specials
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header> */}

      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden text-white bg-slate-900">
        {/* Background Gradient/Image Placeholder */}
        <div className="absolute inset-0 z-0 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay z-0"></div>

        <div className="container relative z-10 px-6 py-20 mx-auto text-center md:py-32 md:text-left" id= 'topHomePageSection'>
          <div className="max-w-2xl">
            <Badge className="px-3 py-1 mb-6 text-sm font-bold tracking-wide text-yellow-900 uppercase bg-yellow-400 border-none hover:bg-yellow-500">
              Limited Time Offer
            </Badge>
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Transform Your Home <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-yellow-400">
                For Less
              </span>
            </h2>
            <p className="max-w-lg mb-8 text-lg leading-relaxed md:text-xl text-slate-300">
              Discover premium furniture and appliances with flexible payment
              plans. Variety of Delivery Options Available.
            </p>
            <div className="flex flex-col justify-center gap-4 md:flex-row md:justify-start">
              <Link to="/public/products">
                <Button
                  size="lg"
                  className="w-full h-12 px-8 text-base font-semibold text-white bg-red-600 border-none shadow-lg md:w-auto hover:bg-red-700 shadow-red-900/20"
                  id= 'shopNowTopHomePageBtn'
                >
                  Shop Now
                </Button>
              </Link>
              <Link to="#">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 px-8 text-base text-white md:w-auto border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                  id= 'viewSpecialsTopHomePageBtn'
                >
                  View Specials
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4" id= 'featuresGridHomePage'>
            {[
              {
                title: "Flexible Payments",
                desc: "12, 24, or 36 month plans",
                icon: <CreditCard className="w-6 h-6 text-red-600" />,
              },
              {
                title: "Flexible Deliveries",
                desc: "Flexible delivery options to suit you",
                icon: <Truck className="w-6 h-6 text-red-600" />,
              },
              {
                title: "Quality Guarantee",
                desc: "2-year warranty included",
                icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
              },
              {
                title: "Weekly Specials",
                desc: "Fresh deals every Monday",
                icon: <Tag className="w-6 h-6 text-red-600" />,
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 transition-colors cursor-default rounded-xl hover:bg-slate-50 group"
              >
                <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-full bg-red-50 group-hover:bg-red-100">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Shop by Category --- */}
      <section className="py-20 bg-slate-50">
        <div className="container px-6 mx-auto">
          <div className="mb-16 text-center" id= 'categorySectionHomePage'>
            <h3 className="mb-4 text-3xl font-bold text-slate-900">
              Shop by Category
            </h3>
            <p className="max-w-2xl mx-auto text-slate-500">
              Explore our wide range of high-quality furniture and appliances
              designed to suit every room in your home.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" id= 'shoppingCategoriesHomePage'>
            {[
              {
                name: "Lounge Suites",
                img: "/src/assets/lounge.jpg",
                color: "bg-orange-100",
                link: "/public/products",
              },
              {
                name: "Bedroom Suites",
                img: "/src/assets/bedroom.jpg",
                color: "bg-blue-100",
                link: "/public/products",
              },
              {
                name: "Kitchen & Appliances",
                img: "/src/assets/appliance.jpg",
                color: "bg-green-100",
                link: "/public/products",
              },
              {
                name: "Dining",
                img: "/src/assets/dinningroom.jpg",
                color: "bg-red-100",
                link: "/public/products",
              },
            ].map((cat) => (
              <Link
                to={cat.link}
                key={cat.name}
                className="relative block overflow-hidden transition-all duration-300 transform bg-white shadow-sm group rounded-2xl hover:shadow-xl hover:-translate-y-1"
              >
                {/* Image Placeholder if generic src fails */}
                <div
                  className={`h-64 w-full ${cat.color} flex items-center justify-center overflow-hidden`}
                >
                  {/* In a real app, use the img src. Here we use a fallback pattern */}
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="object-cover w-full h-full transition-transform duration-700 opacity-90 group-hover:opacity-100 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none"; // Hide broken image
                      e.target.parentNode.classList.add(
                        "flex",
                        "items-center",
                        "justify-center",
                        "bg-slate-200"
                      );
                      e.target.parentNode.innerHTML = `<span class="text-slate-400 font-medium">${cat.name}</span>`;
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-80"></div>

                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h4 className="mb-2 text-xl font-bold text-white">
                    {cat.name}
                  </h4>
                  <span className="inline-flex items-center text-sm font-medium transition-all text-white/90 group-hover:text-white group-hover:translate-x-2">
                    Shop Collection <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="px-6 py-20 text-center text-white bg-red-700">
        <div className="max-w-3xl mx-auto" id= 'bottomHomePageRedSection'>
          <h3 className="mb-6 text-3xl font-bold md:text-4xl">
            Ready to Upgrade Your Home?
          </h3>
          <p className="mb-8 text-lg text-red-100">
            Visit your nearest Lewis store to see our collection in person, or
            start shopping online today for exclusive web-only deals.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/public/products">
              <Button
                size="lg"
                className="w-full h-12 px-8 font-bold text-red-700 bg-white sm:w-auto hover:bg-red-50"
                id= 'startShoppingBottomHomePageBtn'
              >
                Start Shopping
              </Button>
            </Link>
            <Link to="#">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 px-8 text-black border-white sm:w-auto hover:bg-red-800"
                id= 'findAStoreBottomHomePageBtn'
              >
                Find a Store
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
