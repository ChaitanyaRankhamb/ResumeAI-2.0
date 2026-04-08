"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SuccessModal } from "@/components/success-model";
import { loginUser, loginWithGoogle } from "@/components/api/authApi";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { GoogleIcon } from "@/icons/google.icon";
import { useRouter } from "next/navigation";

const FieldDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-muted-foreground mt-1">{children}</p>
);

// Define schema with Zod
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function LoginForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const response = await loginUser(value.email);
        if (response.success) {
          await login();

          setShowSuccess(true);
          
          toast.success("Logged in successfully!");

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } catch (error: any) {
        toast.error(error.message || "Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto grid w-100 gap-6 p-6 border-2 border-border rounded-2xl">
<div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Resume AI</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Build smarter resumes with AI-powered insights and land your dream job faster.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: formSchema.shape.email,
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="name@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-border bg-card text-foreground"
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {(field.state.meta.errors[0] as any)?.message ||
                        field.state.meta.errors[0]}
                    </p>
                  )}
                <FieldDescription>
                  Enter the email address associated with your account.
                </FieldDescription>
              </div>
            )}
          </form.Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isLoading ? "Processing..." : "Continue"}
          </Button>
        </form>
        <Separator className="bg-border" />
<Button
          variant="outline"
          onClick={loginWithGoogle}
          className="w-full border-border text-foreground hover:bg-muted gap-2"
        >
          <GoogleIcon className="w-5 h-5" />
          Continue with Google
        </Button>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        title="Login Successful"
        description="You have been logged in successfully. Redirecting to dashboard..."
        buttonLabel="OK"
        redirectPath="/"
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
