import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
// Removed useRouter import since we're not using manual navigation
import { Login as LoginAPI } from "@/api/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react"; // Added icons for visual appeal
import { useState } from "react"; // For password visibility toggle

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({ className, ...props }) {
  const { login: AuthLogin } = useAuth();
  // Removed router since beforeLoad handles redirects

  const {
    register: loginField,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const loginMutation = useMutation({
    mutationFn: LoginAPI,
    onSuccess: (data) => {
      const token = data.token;
      const id = data.userDetails.id;
      const userData = data.userDetails;
      const userRole = data.userDetails.roles[0];

      console.log("Saved cookies:", document.cookie);
      console.log(data);

      AuthLogin(token, id, userData, userRole);
      toast.success("Successfully logged in!");
      // Removed manual navigation and setTimeout—beforeLoad in the route will handle redirects on next load
    },
    onError: (error) => {
      // Set error to root form field for display
      setError("root", {
        message:
          error.message ||
          "Login failed. Either your password or email is incorrect or you have been banned.",
      });
    },
  });

  const onSubmit = (data) => {
    const user = {
      Email: data.email,
      Password: data.password,
    };
    loginMutation.mutate(user);
  };

  const isLoading = loginMutation.isPending || isSubmitting;

  return (
    <div className={cn("flex flex-col gap-6 min-h-screen justify-center items-center to-indigo-100 p-4", className)} {...props}>
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500 rounded-full">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="email" className="text-sm font-medium text-gray-700">Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="py-3 pl-10 pr-4 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  {...loginField("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password" className="text-sm font-medium text-gray-700">Password</FieldLabel>
                <Link
                  to="#" // Placeholder for forgot password
                  className="text-sm text-red-500 transition-colors duration-200 hover:text-red-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="py-3 pl-10 pr-12 transition-all duration-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  {...loginField("password")}
                />
                <button
                  type="button"
                  className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </Field>
            {errors.root && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-medium text-white transition-all duration-200 bg-red-500 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Log in"
              )}
            </Button>
            <FieldDescription className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-red-500 transition-colors duration-200 hover:text-red-700 underline-offset-4 hover:underline">
                Sign up
              </Link>
            </FieldDescription>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
