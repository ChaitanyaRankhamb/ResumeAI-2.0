"use client";

import { useState, Suspense } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { SuccessModal } from "@/components/success-model";
import { useSearchParams } from "next/navigation";
import {
  verifyEmail,
  resendVerificationCode,
} from "@/components/api/verifyApi";
import { toast } from "sonner";

// Define schema with Zod
const formSchema = z.object({
  otp: z.string().min(6, "Your one-time password must be 6 characters"),
});

function VerifyFormContent() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const form = useForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!email) {
        toast.error("Email is missing. Please try registering again.");
        return;
      }

      setIsLoading(true);
      try {
        await verifyEmail(email, value.otp);
        setShowSuccess(true);
        toast.success("Email verified successfully!");
      } catch (error: any) {
        toast.error(
          error.message || "Verification failed. Please check your code.",
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email is missing. Please try registering again.");
      return;
    }

    setIsResending(true);
    try {
      await resendVerificationCode(email);
      form.reset();
      toast.success("Verification code resent! Please check your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto grid w-100 gap-6 p-6 border-2 border-border rounded-2xl">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Verify Your Email</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Enter the OTP sent to{" "}
            {email ? (
              <span className="font-semibold text-foreground">{email}</span>
            ) : (
              "your email address"
            )}
            .
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          <form.Field
            name="otp"
            validators={{
              onSubmit: formSchema.shape.otp,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-foreground"
                >
                  One-Time Password
                </label>
                <InputOTP
                  maxLength={6}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="border-border text-foreground"
                    />
                    <InputOTPSlot
                      index={1}
                      className="border-border text-foreground"
                    />
                    <InputOTPSlot
                      index={2}
                      className="border-border text-foreground"
                    />
                    <InputOTPSlot
                      index={3}
                      className="border-border text-foreground"
                    />
                    <InputOTPSlot
                      index={4}
                      className="border-border text-foreground"
                    />
                    <InputOTPSlot
                      index={5}
                      className="border-border text-foreground"
                    />
                  </InputOTPGroup>
                </InputOTP>
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {(field.state.meta.errors[0] as any)?.message ||
                        field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <Button
            variant="link"
            disabled={isResending || !email}
            className="p-0 text-primary hover:underline font-medium"
            onClick={handleResendOTP}
          >
            {isResending ? "Resending..." : "Resend"}
          </Button>
        </div>
      </div>

<SuccessModal
        isOpen={showSuccess}
        title="Email Verified"
        description="Your email has been verified successfully. Start building your AI-powered resume now!"
        buttonLabel="Go to Login"
        redirectPath="/dashboard"
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}

export default function VerifyForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-foreground">
          Loading...
        </div>
      }
    >
      <VerifyFormContent />
    </Suspense>
  );
}
