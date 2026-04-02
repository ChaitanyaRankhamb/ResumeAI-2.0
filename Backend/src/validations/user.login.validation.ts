import z, { ZodError } from "zod";
import { AppError } from "../Error/appError";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

export const loginValidation = async (email: string) => {
  try {
    const validatedData = loginSchema.parse({ email });

    return validatedData;
  } catch (error) {
    console.log(error);

    if (error instanceof ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    throw error;
  }
};
