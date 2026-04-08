"use client";

import { useState, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import debounce from "lodash/debounce";
import { toast } from "sonner";

import { registerUser } from "@/components/api/authApi";
import { checkUsernameAvailability } from "@/components/api/usernameApi";
import { formSchema } from "./constants";

export function useRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    available: null as boolean | null,
    message: "",
  });

  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) {
        setUsernameStatus({ isChecking: false, available: null, message: "" });
        return;
      }

      setUsernameStatus((prev) => ({ ...prev, isChecking: true }));

      try {
        const data = await checkUsernameAvailability(username);
        setUsernameStatus({
          isChecking: false,
          available: data.available,
          message: data.message,
        });
      } catch {
        setUsernameStatus({
          isChecking: false,
          available: null,
          message: "Error checking username",
        });
      }
    }, 500),
    []
  );

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (usernameStatus.available === false) {
        toast.error("Please choose an available username.");
        return;
      }

      setIsLoading(true);
      try {
        await registerUser(value.username, value.email);
        setShowSuccess(true);
        toast.success("Registration successful!");
      } catch (error: any) {
        toast.error(error.message || "Failed to register.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return {
    form,
    isLoading,
    showSuccess,
    setShowSuccess,
    usernameStatus,
    checkUsername,
  };
}