import { AppError } from "../../Error/appError";
import { AuthProvider, ProviderType } from "./AuthProvider";
import { UserId } from "./userId";

export class User {
  private providers: AuthProvider[] = [];

  private verificationCode?: number;
  private verificationExpiry?: Date;

  constructor(
    public readonly id: UserId,
    private email: string,
    private username?: string,
    private avatar?: string,
    private emailVerified: boolean = false,
    private isActive: boolean = true,
    providers: AuthProvider[] = [],
    verificationCode?: number,
    verificationExpiry?: Date,
    public readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
    
  ) {
    this.providers = providers;
    this.verificationCode = verificationCode;
    this.verificationExpiry = verificationExpiry;
  }

  addProvider(provider: AuthProvider) {
    const exists = this.providers.find((p) => p.type === provider.type);

    if (exists) {
      throw new AppError("Provider Already Linked", 400);
    }

    this.providers.push(provider);
    this.touch();
  }

  getProviders(): AuthProvider[] {
    return this.providers;
  }

  hasProvider(type: ProviderType): boolean {
    return this.providers.some((p) => p.type === type);
  }

  setVerification(code: number, expiry: Date) {
    this.verificationCode = code;
    this.verificationExpiry = expiry;
    this.touch();
  }

  clearVerificationData(): void {
  this.verificationCode = undefined;
  this.verificationExpiry = undefined;
}

  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  setEmailVerified(value: boolean): void {
  this.emailVerified = value;
}

  getEmail(): string {
    return this.email;
  }

  getUsername(): string | undefined {
    return this.username;
  }

  getAvatar(): string | undefined {
    return this.avatar;
  }

  isUserActive(): boolean {
    return this.isActive;
  }

  getVerificationCode(): number | undefined {
    return this.verificationCode;
  }

  getVerificationExpiry(): Date | undefined {
    return this.verificationExpiry;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
