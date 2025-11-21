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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...loginField("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="#" // Placeholder for forgot password
                    className="inline-block ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...loginField("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              {errors.root && (
                <p className="text-sm text-red-500">{errors.root.message}</p>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Log in"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link to="/register">Sign up</Link>{" "}
                  {/* Fixed: use 'to' instead of 'href' */}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
