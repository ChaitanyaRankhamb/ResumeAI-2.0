import z, { ZodError } from "zod";
import { AppError } from "../Error/appError";

const resendSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

export const resendValidation = async (email: string) => {
  try {
    const validatedData = resendSchema.parse(email);

    return validatedData;
  } catch (error) {
    console.log(error);

    if (error instanceof ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    throw error;
  }
};
