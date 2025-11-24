import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Heart,
  Wallet,
  Users,
  ShieldCheck,
  Zap,
  Truck,
  CreditCard,
  CheckCircle2,
  MapPin,
  Star,
  ArrowRight
} from "lucide-react";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900">
      
      {/* --- Hero Section --- */}
      <section className="relative flex items-center justify-center min-h-[80vh] text-center text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-fixed bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1092&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
        </div>

        <div className="container relative z-10 max-w-4xl px-6 mx-auto">
          <Badge className="mb-6 bg-red-600 hover:bg-red-700 text-white border-none px-4 py-1.5 text-base font-medium rounded-full shadow-lg shadow-red-900/20">
            Est. 1906
          </Badge>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Our Story
          </h1>
          <p className="max-w-3xl mx-auto text-lg font-light leading-relaxed md:text-2xl text-slate-200">
            For over a century, we've been helping South African families create beautiful, comfortable homes they love.
          </p>
        </div>
      </section>

      {/* --- Stats Bar --- */}
      <section className="relative z-20 mx-4 -mt-8 overflow-hidden text-white bg-red-700 shadow-xl md:mx-8 rounded-2xl">
        <div className="container px-6 py-12 mx-auto">
          <div className="grid grid-cols-2 gap-8 text-center divide-x md:grid-cols-4 divide-red-600/50">
            {[
              { num: "117+", label: "Years in Business" },
              { num: "500+", label: "Retail Stores" },
              { num: "5M+", label: "Happy Customers" },
              { num: "10K+", label: "Products Available" },
            ].map((stat, i) => (
              <div key={i} className="px-4">
                <h3 className="mb-1 text-4xl font-black md:text-5xl">{stat.num}</h3>
                <p className="text-sm font-medium tracking-wider text-red-100 uppercase md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Heritage Section --- */}
      <section className="py-24 bg-white">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              <div>
                <span className="text-sm font-bold tracking-wider text-red-600 uppercase">Our Heritage</span>
                <h2 className="mt-2 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                  117+ Years of <br className="hidden md:block"/> Excellence
                </h2>
              </div>
              
              <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                <p>
                  Founded in 1906, Lewis has grown from a single store into Southern Africa's largest and most trusted furniture retailer. Our journey has been built on a foundation of quality, affordability, and a deep commitment to serving our communities.
                </p>
                <p>
                  What started as a small family business has evolved into a household name, trusted by millions of families across the region. We believe in building relationships that last generations.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {["Family-Owned Heritage", "Trusted by Millions", "Community Focused"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 font-medium border rounded-full bg-slate-50 border-slate-100 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute transition duration-500 opacity-50 -inset-4 bg-gradient-to-r from-red-100 to-blue-50 rounded-3xl blur-lg group-hover:opacity-75"></div>
              <img
                src="/public/beautiful living room.jpg" // Assuming this path works in your setup
                alt="Beautiful living room"
                className="relative w-full rounded-2xl shadow-2xl transition transform group-hover:scale-[1.01] duration-500 object-cover h-[500px]"
                onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2070&auto=format&fit=crop"; // Fallback image
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Core Values --- */}
      <section className="py-24 bg-slate-50">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <Badge variant="outline" className="px-4 py-1 mb-4 text-red-700 border-red-200 bg-red-50">
              What We Stand For
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
              Our Core Values
            </h2>
            <p className="text-lg text-slate-600">
              These principles guide everything we do, from selecting products to serving our customers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Trophy className="w-8 h-8 text-red-600" />,
                title: "Quality First",
                desc: "We partner with the world's leading manufacturers to bring you durable, stylish furniture.",
              },
              {
                icon: <Heart className="w-8 h-8 text-red-600" />,
                title: "Customer Care",
                desc: "Our customers are family. We go above and beyond to ensure your satisfaction.",
              },
              {
                icon: <Wallet className="w-8 h-8 text-red-600" />,
                title: "Affordability",
                desc: "Quality furniture should be accessible to everyone — no matter your budget.",
              },
              {
                icon: <Users className="w-8 h-8 text-red-600" />,
                title: "Community Focus",
                desc: "We're committed to giving back to the communities that have supported us for generations.",
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-red-600" />,
                title: "Trust & Integrity",
                desc: "Transparency and honesty are at the heart of everything we do.",
              },
              {
                icon: <Zap className="w-8 h-8 text-red-600" />,
                title: "Innovation",
                desc: "We continuously evolve, embracing new technologies and trends.",
              },
            ].map((val, i) => (
              <Card key={i} className="transition-all duration-300 shadow-sm border-slate-100 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="p-4 mb-6 bg-red-50 rounded-2xl w-fit">
                    {val.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{val.title}</h3>
                  <p className="leading-relaxed text-slate-600">{val.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- The Lewis Difference --- */}
      <section className="py-24 overflow-hidden bg-white">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            {/* Image Column */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute w-40 h-40 bg-yellow-100 rounded-full opacity-50 top-10 -left-10 blur-3xl"></div>
              <div className="absolute w-40 h-40 bg-red-100 rounded-full opacity-50 bottom-10 -right-10 blur-3xl"></div>
              
              <img
                src="/public/modernshowroom.jpg"
                alt="Modern showroom"
                className="relative z-10 w-full shadow-2xl rounded-3xl"
                onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"; 
                }}
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 right-8 z-20 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]">
                <div className="flex items-center gap-1 mb-2 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div className="text-3xl font-bold text-slate-900">4.8/5</div>
                <div className="mt-1 text-sm font-medium text-slate-500">Average Customer Rating</div>
              </div>
            </div>

            {/* Text Column */}
            <div className="order-1 lg:order-2">
              <h2 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
                The Lewis Difference
              </h2>
              <p className="mb-10 text-lg text-slate-600">
                When you choose Lewis, you're choosing more than just furniture — you're choosing a partner committed to making your house a home.
              </p>
              
              <div className="grid gap-8">
                {[
                  {
                    icon: <Truck className="w-6 h-6 text-white" />,
                    title: "Free Delivery",
                    desc: "On all orders over R5,000 straight to your doorstep",
                  },
                  {
                    icon: <CreditCard className="w-6 h-6 text-white" />,
                    title: "Flexible Payment Plans",
                    desc: "Easy monthly installments to suit every budget",
                  },
                  {
                    icon: <CheckCircle2 className="w-6 h-6 text-white" />,
                    title: "Quality Guarantee",
                    desc: "All products come with comprehensive warranties",
                  },
                  {
                    icon: <MapPin className="w-6 h-6 text-white" />,
                    title: "Nationwide Coverage",
                    desc: "500+ stores across Southern Africa",
                  },
                ].map((f, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="flex items-center justify-center w-12 h-12 transition-colors bg-red-600 shadow-md shrink-0 rounded-xl shadow-red-200 group-hover:bg-red-700">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-bold text-slate-900">{f.title}</h3>
                      <p className="text-slate-600">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="relative py-24 overflow-hidden text-center text-white bg-gradient-to-br from-slate-900 to-red-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container relative z-10 px-6 mx-auto">
          <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Ready to Transform Your Home?
          </h2>
          <p className="max-w-2xl mx-auto mb-10 text-xl text-red-100">
            Visit us in-store or browse our extensive collection online to find the perfect pieces for your space.
          </p>
          <Link to="/products">
            <Button size="lg" className="px-10 text-lg font-bold text-red-700 transition-all bg-white rounded-full shadow-2xl hover:bg-red-50 h-14 hover:scale-105">
              Shop Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;