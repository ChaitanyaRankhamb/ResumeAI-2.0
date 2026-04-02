import { UserId } from "../../../entities/user/userId";
import fs from "fs";
import path from "path";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { CreateFileData } from "../../../entities/files/fileRepo";
import { randomUUID } from "crypto";

interface fileServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const resumeFileService = async (
  userId: UserId,
  resume: Express.Multer.File,
): Promise<fileServiceResponse> => {
  try {
    // Base upload directory
    const uploadDir = path.join(__dirname, "../../../../upload");
    
    // User-specific directory
    const userDir = path.join(uploadDir, String(userId));

    // Ensure folders exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // File metadata
    const fileId = randomUUID();
    const extension = path.extname(resume.originalname);
    const fileName = `${fileId}${extension}`;
    const filePath = path.join(userDir, fileName);

    // Save file
    fs.writeFileSync(filePath, resume.buffer);

    // Create file entity
    const fileEntity: CreateFileData = {
      userId: userId,
      name: fileName,
      originalName: resume.originalname,
      path: `upload/${userId}/${fileName}`,
      size: resume.size,
      format: resume.mimetype,
      uploadedAt: new Date(),
    };

    // Save to DB
    const file = await fileRepository.createFile(fileEntity);

    if (!file) {
      return {
        success: false,
        message: "file saved error",
      };
    }

    return {
      success: true,
      message: "Resume file saved successfully",
      data: {
        fileId: file.id, // Unique resume identity
        fileName,
        filePath: `/${fileEntity.path}`,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error saving resume: ${err.message}`,
    };
  }
};
