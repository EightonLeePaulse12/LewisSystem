import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  User,
  MessageSquare,
  HelpCircle,
  Building2
} from "lucide-react";
import { toast } from "sonner";

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Simple form state management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch("https://formspree.io/f/meonakpz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      toast.success("Message sent successfully!", {
        description: "We'll get back to you shortly.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } else {
      toast.error("Failed to send message. Try again?");
    }
  } catch(error) {
    toast.error("Network error — please try again", error);
  }

  setIsLoading(false);
};


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-red-100">
      <div className="container max-w-6xl mx-auto">
        
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
          
          {/* LEFT SIDE: Contact Info (Dark/Colored Background) */}
          <div className="relative flex flex-col justify-between p-8 overflow-hidden text-white lg:col-span-2 bg-slate-900 lg:p-12">
            
            {/* Decorative Background Circles */}
            <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-red-600 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>

            <div className="relative z-10" id= 'contactPageTopBanner'>
              <h2 className="mb-2 text-3xl font-bold">Get in Touch</h2>
              <p className="mb-8 text-slate-300">
                Have questions about our products or your order? We're here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white/10">
                    <Mail className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Email Us</h3>
                    <p className="text-sm text-slate-400">support@lewisstores.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white/10">
                    <Phone className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Call Us</h3>
                    <p className="text-sm text-slate-400">0800 111 123</p>
                    <p className="text-xs text-slate-500">Mon-Fri from 8am to 5pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white/10">
                    <MapPin className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Visit Us</h3>
                    <p className="text-sm text-slate-400">
                      Universal House, 53A Victoria Road<br />
                      Woodstock, Cape Town, 7925, South Africa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 lg:mt-0">
              <div className="flex gap-4">
                {/* Social placeholders could go here */}
                <div className="flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer bg-white/10 hover:bg-white/20">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="p-8 bg-white lg:col-span-3 lg:p-12">
            <div className="mb-6" id= 'contactPageMsgHeader'>
              <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
              <p className="mt-1 text-sm text-gray-500">
                Fill out the form below and we'll start a conversation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="John Doe" 
                      className="transition-colors border-gray-200 pl-9 bg-gray-50 focus:bg-white"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      placeholder="john@example.com" 
                      className="transition-colors border-gray-200 pl-9 bg-gray-50 focus:bg-white"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Subject Select */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Topic</Label>
                <div className="relative" id= 'selectDropDown'>
                   <HelpCircle className="absolute z-10 w-4 h-4 text-gray-400 pointer-events-none left-3 top-3" />
                   <Select 
                      onValueChange={(val) => setFormData({ ...formData, subject: val })}
                      value={formData.subject}
                    >
                    <SelectTrigger className="w-full border-gray-200 pl-9 bg-gray-50" id= 'selectBtn'>
                      <SelectValue placeholder="What is this regarding?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general" id='general'>General Inquiry</SelectItem>
                      <SelectItem value="support">Order Support</SelectItem>
                      <SelectItem value="sales">Sales & Bulk Orders</SelectItem>
                      <SelectItem value="feedback">Website Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                <div className="relative">
                  <MessageSquare className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Textarea 
                    id="message" 
                    name="message"
                    placeholder="Tell us how we can help..." 
                    className="min-h-[150px] pl-9 resize-none bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full py-6 text-base font-medium text-white transition-all duration-200 bg-red-600 shadow-lg hover:bg-red-700 shadow-red-100"
                id= 'sendMsg'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}