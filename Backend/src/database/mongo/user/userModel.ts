import mongoose, { Schema, Document, Types } from "mongoose";
import z from "zod";

export type ProviderType = "google" | "credentials";

export interface Provider {
  type: ProviderType;
  providerId: string; // Google ID or "LOCAL"
}

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  username?: string;
  avatar?: string;
  emailVerified: boolean;
  verificationCode?: number;
  verificationExpiry?: Date;
  isActive: boolean;
  providers: Provider[];
  createdAt: Date;
  updatedAt: Date;
}

// zod validation

export const ProviderZodSchema = z.object({
  type: z.enum(["google", "credentials"]),
  providerId: z.string(),
});

export const UserZodSchema = z
  .object({
    email: z.string().email({ message: "email is required" }),

    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." })
      .max(30, { message: "Username must be at most 30 characters." })
      .optional(),

    avatar: z
      .string()
      .url({ message: "Avatar must be a valid URL." })
      .optional(),

    emailVerified: z.boolean().default(false),

    verificationCode: z.number().optional(),

    verificationExpiry: z.date().optional(),

    isActive: z.boolean().default(true),

    providers: z.array(ProviderZodSchema).default([]),
  })
  .strict();

// mongoDB schema

const providerSchema = new Schema<Provider>({
  type: {
    type: String,
    enum: ["google", "credentials"],
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true, // add index to make database fast
    },

    username: {
      type: String,
      trim: true,
      index: true, // add index
    },

    avatar: {
      type: String,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: Number,
      index: true, // for verification
    },

    verificationExpiry: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    providers: {
      type: [providerSchema],
      default: [],
    },
  },
  {
    timestamps: true, // auto createdAt & updatedAt
  },
);

userSchema.index(
  {
    "providers.type": 1,
    "providers.providerId": 1,
  },
  { unique: true },
);

export const UserModel = mongoose.model<UserDocument>("user", userSchema);