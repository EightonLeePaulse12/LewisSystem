import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Link } from "@tanstack/react-router"; // Use Link instead of <a>
import { Register as registerAPI } from "@/api/auth";
import { UserPlus, User, Mail, Phone, MapPin, Building, Hash, Lock, Eye, EyeOff } from "lucide-react"; // Added icons
import { useState } from "react"; // For password visibility toggles
import { cn } from "@/lib/utils"; // Assuming this is available

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    idNumber: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegisterForm = ({ className, ...props }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: registerAPI,
    onSuccess: () => {
      toast.success("Successfully registered, Redirecting to login...");
      setTimeout(() => {
        router.navigate({
          to: "/login",
        });
      }, 2000);
    },
    onError: (error) => {
      setError("root", { message: error.message || "Registration failed" });
    },
  });

  const onSubmit = (data) => {
    const user = {
      Name: data.name,
      Email: data.email,
      Phone: data.phone,
      Address: data.address,
      City: data.city,
      PostalCode: data.postalCode,
      IDNumber: data.idNumber,
      Password: data.password,
      ConfirmPassword: data.confirmPassword,
    };
    registerMutation.mutate(user);
  };

  const isLoading = registerMutation.isPending || isSubmitting;

  return (
    <div className={cn("flex flex-col gap-6 min-h-screen justify-center items-center p-4", className)} {...props}>
      <Card className="w-full max-w-4xl border-0 shadow-xl bg-white/80 backdrop-blur-sm"> {/* Increased max-width to 4xl for more width */}
        <CardHeader className="pb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500 rounded-full" id= 'createAccountIcon'>
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900" id= 'createAccountTitle'>Create Your Account</CardTitle>
          <CardDescription className="text-gray-600" id= 'createAccountDescription'>
            Fill in your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800" id= 'personalInfoHeader'>Personal Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</FieldLabel>
                  <div className="relative">
                    <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="email" className="text-sm font-medium text-gray-700">Email</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("email")}
                    />
                  </div>
                  <FieldDescription className="mt-1 text-xs text-gray-500">
                    We&apos;ll use this to contact you. We will not share your email with anyone else.
                  </FieldDescription>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="123-456-7890"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="idNumber" className="text-sm font-medium text-gray-700">ID Number</FieldLabel>
                  <div className="relative">
                    <Hash className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="Your ID (optional)"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("idNumber")}
                    />
                  </div>
                  {errors.idNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.idNumber.message}</p>
                  )}
                </Field>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800" id= 'addressInfoHeader'>Address Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="address" className="text-sm font-medium text-gray-700">Address</FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main St"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("address")}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="city" className="text-sm font-medium text-gray-700">City</FieldLabel>
                  <div className="relative">
                    <Building className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="city"
                      type="text"
                      placeholder="Anytown"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("city")}
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="postalCode" className="text-sm font-medium text-gray-700">Postal Code</FieldLabel>
                  <div className="relative">
                    <Hash className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="12345"
                      className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("postalCode")}
                    />
                  </div>
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
                  )}
                </Field>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800" id= 'securtiyInfoHeader'>Security</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password" className="text-sm font-medium text-gray-700">Password</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="py-3 pl-10 pr-12 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      id= 'show1PassRegister'
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <FieldDescription className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long.
                  </FieldDescription>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="py-3 pl-10 pr-12 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      id= 'showConfirmPassRegister'
          
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <FieldDescription className="mt-1 text-xs text-gray-500">Please confirm your password.</FieldDescription>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </Field>
              </div>
            </div>

            {errors.root && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-medium text-white transition-all duration-200 bg-red-500 rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              id= 'submitRegister'
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>

            <FieldDescription className="text-sm text-center text-gray-600" id= 'alreadyHaveAcoount'>
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-red-500 transition-colors duration-200 underline-offset-4 hover:underline" id= 'signInLink'>
                Sign in
              </Link>
            </FieldDescription>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};