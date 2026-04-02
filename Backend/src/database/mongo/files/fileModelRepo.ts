import mongoose from "mongoose";
import { File } from "../../../entities/files/file";
import type {
  FileRepository as IFileRepository,
  CreateFileData,
} from "../../../entities/files/fileRepo";
import { UserId } from "../../../entities/user/userId";
import { FileDocument, FileModel } from "./fileModel";
import { defaultResumeStructuredData } from "../../../modules/resume/Normalization/types/normalizedResume";

/**
 * Converts a Mongoose FileDocument to your domain File entity
 */
function docToFile(doc: FileDocument): File {
  return new File(
    doc._id.toString(), // file id
    new UserId(doc.userId.toString()), // user id
    doc.name,
    doc.originalName,
    doc.path,
    doc.size,
    doc.format,
    doc.uploadedAt,
    doc.parseText || [], // parsed text sections
    doc.structuredData || defaultResumeStructuredData(), // structured data from AI
  );
}

export class MongoFileRepository implements IFileRepository {
  async createFile(data: CreateFileData): Promise<File> {
    // Check for duplicate upload by same user
    const existing = await FileModel.findOne({
      userId: new mongoose.Types.ObjectId(data.userId.toString()),
    });

    if (existing) {
      // Optionally update uploadedAt timestamp
      existing.uploadedAt = new Date();
      await existing.save();
      return docToFile(existing);
    }

    // No duplicate, create new
    const doc = await FileModel.create({
      userId: new mongoose.Types.ObjectId(data.userId.toString()),
      name: data.name,
      originalName: data.originalName,
      path: data.path,
      size: data.size,
      format: data.format,
      uploadedAt: data.uploadedAt ?? new Date(),
      parseText: data.parseText || [], // parsed text sections
      structuredData: data.structuredData || defaultResumeStructuredData(), // structured data
    });

    return docToFile(doc);
  }

  async updateFile(file: File): Promise<File | null> {
    const doc = await FileModel.findByIdAndUpdate(
      file.id,
      {
        name: file.getName(),
        originalName: file.getOriginalName(),
        path: file.getPath(),
        size: file.getSize(),
        format: file.getFormat(),
        uploadedAt: file.uploadedAt,
        parseText: file.getParseText(), // update parsed text
        structuredData: file.getStructuredData(), // update structured data
      },
      { new: true }, // return updated document
    );

    return doc ? docToFile(doc) : null;
  }

  async deleteFile(id: string): Promise<File | null> {
    const doc = await FileModel.findByIdAndDelete(id);
    return doc ? docToFile(doc) : null;
  }

  async findFileById(id: string): Promise<File | null> {
    const doc = await FileModel.findById(id);
    return doc ? docToFile(doc) : null;
  }

  async findFilesByUser(userId: UserId): Promise<File[]> {
    const docs = await FileModel.find({
      userId: new mongoose.Types.ObjectId(userId.toString()),
    });

    return docs.map(docToFile);
  }

  async findFileByUserAndHash(
    userId: UserId,
    hash: string,
  ): Promise<File | null> {
    const doc = await FileModel.findOne({
      userId: new mongoose.Types.ObjectId(userId.toString()),
      hash,
    });
    return doc ? docToFile(doc) : null;
  }

  async findFilesByHash(hash: string): Promise<File[]> {
    const docs = await FileModel.find({ hash });
    return docs.map(docToFile);
  }
}

export const fileRepository = new MongoFileRepository();
