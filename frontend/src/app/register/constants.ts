import { z } from "zod";

export const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
});

export type RegisterFormValues = z.infer<typeof formSchema>;