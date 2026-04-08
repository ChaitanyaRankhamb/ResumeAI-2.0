"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SuccessModal } from "@/components/success-model";
import { registerUser, loginWithGoogle } from "@/components/api/authApi";
import { checkUsernameAvailability } from "@/components/api/usernameApi";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { GoogleIcon } from "@/icons/google.icon";
import { useRegisterForm } from "./useRegistrationFrom";
import { formSchema } from "./constants";

const FieldDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-muted-foreground mt-1">{children}</p>
);

export default function RegisterForm() {
  const {
    form,
    isLoading,
    showSuccess,
    setShowSuccess,
    usernameStatus,
    checkUsername,
  } = useRegisterForm();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto grid w-100 gap-6 p-6 border-2 border-border rounded-2xl">
<div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Resume AI</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Create your account and start building AI-powered resumes today.
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
            name="username"
            validators={{
              onChange: formSchema.shape.username,
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-foreground"
                >
                  Username
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Your username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    checkUsername(e.target.value);
                  }}
                  className="border-border bg-card text-foreground"
                />
                {usernameStatus.isChecking && (
                  <p className="text-xs text-muted-foreground animate-pulse">
                    Checking availability...
                  </p>
                )}
                {!usernameStatus.isChecking &&
                  usernameStatus.available !== null && (
                    <p
                      className={`text-xs font-medium ${
                        usernameStatus.available
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {usernameStatus.message}
                    </p>
                  )}
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 &&
                  field.state.value && (
                    <p className="text-xs text-destructive">
                      {(field.state.meta.errors[0] as any)?.message ||
                        field.state.meta.errors[0]}
                    </p>
                  )}
                <FieldDescription>
                  Username must contain at least 3 characters.
                </FieldDescription>
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onSubmit: formSchema.shape.email,
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
                  field.state.meta.errors.length > 0 &&
                  field.state.value && (
                    <p className="text-xs text-destructive">
                      {(field.state.meta.errors[0] as any)?.message ||
                        field.state.meta.errors[0]}
                    </p>
                  )}
                <FieldDescription>
                  We'll send a verification link to this email address.
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Log in
          </Link>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        title="Registration Successful"
        description="Your account has been created. Please verify your email to continue."
        buttonLabel="Verify Email"
        redirectPath={`/verify?email=${encodeURIComponent(form.state.values.email)}`}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
