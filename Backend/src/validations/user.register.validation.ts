import { z } from "zod";
import { AppError } from "../Error/appError";

// Define schema
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .trim(),

  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

// Validation function
export const registerValidation = async (username: string, email: string) => {
  try {
    const validatedData = registerSchema.parse({
      username,
      email,
    });

    return validatedData; // clean & validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    throw error;
  }
};
