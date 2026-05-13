import mongoose, { Schema, Document, Types } from "mongoose";
import z from "zod";
import { ResumeStructuredData } from "../../../modules/resume/Normalization";
import { ResumeUploadResponse } from "../../../../../types/resumeUploadResponse.d";


// zod validation
export const FileZodSchema = z.object({
  userId: z.string(), // Mongo ObjectId as string
  name: z.string().min(1, "File name is required"),
  originalName: z.string().min(1, "Original file name is required"),
  path: z.string().min(1, "File path is required"),
  size: z.number().positive("File size must be positive"),
  format: z.string().min(1, "File format is required"),
  hash: z.string().min(64).max(64), // SHA-256 hash (64 hex characters)
  uploadedAt: z.date().optional(),
  parseText: z.array(z.string()).optional(), // Array of parsed text sections
  structuredData: z.any().optional(), // Structured JSON data from AI
  analyzedData: z.any().optional(), // Analyzed JSON data from AI
});

export interface FileDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // reference to User
  name: string;
  originalName: string;
  path: string;
  size: number; // in kb or mb
  format: string;
  hash: string; // SHA-256 hash for deduplication
  uploadedAt: Date;
  parseText?: string[]; // Array of parsed text sections
  structuredData?: ResumeStructuredData; // Structured JSON data from AI processing
  analyzedData?: ResumeUploadResponse; // Analyzed JSON data from AI processing
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
    hash: {
      type: String,
      required: true,
      index: true,
      minlength: 64,
      maxlength: 64,
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
    analyzedData: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: prevent duplicate files (same user + same hash)
fileSchema.index({ userId: 1, hash: 1 }, { unique: true });

// Single index on hash for quick lookups
fileSchema.index({ hash: 1 });

export const FileModel = mongoose.model<FileDocument>(
  "uploadedfile",
  fileSchema,
);
