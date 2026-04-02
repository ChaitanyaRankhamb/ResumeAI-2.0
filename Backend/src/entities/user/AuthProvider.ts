import { AppError } from "../../Error/appError";

export type ProviderType = "google" | "credentials";

export class AuthProvider {
  constructor(
    public readonly type: ProviderType,
    public readonly providerId: string,

  ) {
    if (!providerId) {
      throw new AppError("ProviderId is required", 500);
    }
  }

  static credentials(email: string): AuthProvider {
    return new AuthProvider("credentials", email);
  }

  static google(providerId: string): AuthProvider {
    return new AuthProvider("google", providerId);
  }

  getProviderUserId(): string {
    return this.providerId;
  }
}
