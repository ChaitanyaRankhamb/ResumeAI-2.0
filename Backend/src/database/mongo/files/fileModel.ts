import mongoose, { Schema, Document, Types } from "mongoose";
import z from "zod";
import { ResumeStructuredData } from "../../../modules/resume/Normalization";


// zod validation
export const FileZodSchema = z.object({
  userId: z.string(), // Mongo ObjectId as string
  name: z.string().min(1, "File name is required"),
  originalName: z.string().min(1, "Original file name is required"),
  path: z.string().min(1, "File path is required"),
  size: z.number().positive("File size must be positive"),
  format: z.string().min(1, "File format is required"),
  uploadedAt: z.date().optional(),
  parseText: z.array(z.string()).optional(), // Array of parsed text sections
  structuredData: z.any().optional(), // Structured JSON data from AI
});

export interface FileDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // reference to User
  name: string;
  originalName: string;
  path: string;
  size: number; // in kb or mb
  format: string;
  uploadedAt: Date;
  parseText?: string[]; // Array of parsed text sections
  structuredData?: ResumeStructuredData; // Structured JSON data from AI processing
  createdAt: Date;
  updatedAt: Date;
}

// mongoose schema
const fileSchema = new Schema<FileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    format: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: () => new Date(),
    },
    parseText: {
      type: [String], // Array of strings for parsed text sections
      default: [],
    },
    structuredData: {
      type: Schema.Types.Mixed, // Flexible schema for AI-generated JSON
      default: null,
    },
  },
  {
    timestamps: true, // auto-createdAt & updatedAt
  },
);

// Ensures same user cannot upload the same file twice
fileSchema.index({ userId: 1 }, { unique: true });

export const FileModel = mongoose.model<FileDocument>(
  "uploadedfile",
  fileSchema,
);
