import { z, ZodError } from "zod";
import { AppError } from "../Error/appError";

const verifyCodeSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  code: z
    .number("verification code must be a number")
    .int("Code must be an integer")
    .min(100000, "Code must be 6 digits")
    .max(999999, "Code must be 6 digits"),
});

export const verifyCodeValidation = (email: any, code: any) => {
  try {
    const data = {
      email, 
      code
    }
    // safe & strict parsing
    const validatedData = verifyCodeSchema.parse(data);
    return validatedData;

  } catch (error) {
    if (error instanceof ZodError) {
      // return first meaningful error
      throw new AppError(error.issues[0].message, 400);
    }

    // fallback error
    throw new AppError("Validation failed", 500);
  }
};