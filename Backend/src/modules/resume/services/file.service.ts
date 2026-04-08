import { UserId } from "../../../entities/user/userId";
import path from "path";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { CreateFileData } from "../../../entities/files/fileRepo";
import { createHash, randomUUID } from "crypto";
import { promises as fs } from "fs";

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
    // STEP 1: Validate input
    if (!resume || !resume.buffer) {
      return {
        success: false,
        message: "No file provided or file buffer is empty",
      };
    }

    const originalName = resume.originalname;
    console.log(`[FileService] Starting upload for user: ${userId}, file: ${originalName}`);

    // STEP 2: Generate SHA-256 hash of file content
    const hash = createHash("sha256");
    hash.update(resume.buffer);
    const fileHash = hash.digest("hex");
    console.log(`[FileService] File hash: ${fileHash}`);

    // STEP 3: Check if file with same userId and fileHash already exists
    console.log(`[FileService] Checking for duplicate (userId: ${userId}, hash: ${fileHash})`);
    const existingFile = await fileRepository.findFileByUserAndHash(userId, fileHash);

    if (existingFile) {
      console.log(`[FileService] Duplicate found! Returning existing file: ${existingFile.id}`);
      return {
        success: true,
        message: "File already exists - deduplication successful",
        data: {
          fileId: existingFile.id,
          fileName: existingFile.getName(),
          filePath: `/${existingFile.getPath()}`,
          hash: fileHash,
          isDuplicate: true,
        },
      };
    }

    console.log(`[FileService] No duplicate found. Proceeding with upload.`);

    // STEP 4: Create upload directory structure
    const baseUploadDir = path.join(__dirname, "../../../../upload");
    const userUploadDir = path.join(baseUploadDir, String(userId));

    console.log(`[FileService] Creating directories: ${userUploadDir}`);
    await fs.mkdir(baseUploadDir, { recursive: true });
    await fs.mkdir(userUploadDir, { recursive: true });

    // STEP 5: Generate unique filename and save file
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const uuid = randomUUID().substring(0, 8);
    const fileName = `${uuid}-${timestamp}${ext}`;
    const filePath = path.join(userUploadDir, fileName);

    console.log(`[FileService] Saving file: ${filePath}`);
    await fs.writeFile(filePath, resume.buffer, { flag: "wx" });
    console.log(`[FileService] File saved successfully`);

    // STEP 6: Create file metadata and save to database
    const uploadPath = path.posix.join("upload", String(userId), fileName);
    const fileEntity: CreateFileData = {
      userId: userId,
      name: fileName,
      originalName: originalName,
      path: uploadPath,
      size: resume.size,
      format: resume.mimetype,
      hash: fileHash,
      uploadedAt: new Date(),
    };

    console.log(`[FileService] Saving metadata to database`);
    const file = await fileRepository.createFile(fileEntity);

    if (!file) {
      return {
        success: false,
        message: "Failed to save file metadata to database",
      };
    }

    console.log(`[FileService] Upload completed successfully. File ID: ${file.id}`);

    // STEP 7: Return success response
    return {
      success: true,
      message: "Resume file uploaded successfully",
      data: {
        fileId: file.id,
        fileName: fileName,
        filePath: `/${uploadPath}`,
        fileHash: fileHash,
        isDuplicate: false,
      },
    };
  } catch (err: any) {
    console.error(`[FileService] Error: ${err.message}`);
    return {
      success: false,
      message: `Error uploading resume: ${err.message}`,
    };
  }
};
