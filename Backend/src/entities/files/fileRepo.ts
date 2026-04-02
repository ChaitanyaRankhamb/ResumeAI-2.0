import { ResumeStructuredData } from "../../modules/resume/Normalization/types/normalizedResume";
import { UserId } from "../user/userId";
import { File } from "./file";

export interface CreateFileData {
  userId: UserId; // ID of the user who uploaded the file
  name: string; // stored file name
  originalName: string; // original file name
  path: string; // storage path
  size: number; // in kb or mb
  format: string; // file extension/type
  uploadedAt?: Date; // default to current date if not provided
  parseText?: string[]; // array of parsed text sections from the resume
  structuredData?: ResumeStructuredData; // structured JSON data from AI processing
}

export interface FileRepository {
  createFile(data: CreateFileData): Promise<File | null>;

  updateFile(file: File): Promise<File | null>;

  deleteFile(id: string): Promise<File | null>;

  findFileById(id: string): Promise<File | null>;

  findFilesByUser(userId: UserId): Promise<File[]>;
}
