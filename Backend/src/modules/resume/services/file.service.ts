import { UserId } from "../../../entities/user/userId";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { CreateFileData } from "../../../entities/files/fileRepo";
import { createHash, randomUUID } from "crypto";
import minioClient from "../../../config/minio.connection";

interface FileServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const resumeFileService = async (
  userId: UserId,
  resume: Express.Multer.File,
): Promise<FileServiceResponse> => {
  try {
    // STEP 1: Validate uploaded file
    if (!resume || !resume.buffer) {
      return {
        success: false,
        message: "No file provided or file buffer is empty",
      };
    }

    const originalName = resume.originalname;

    console.log(
      `[FileService] Starting upload for user: ${userId}, file: ${originalName}`,
    );

    // STEP 2: Generate SHA-256 hash for deduplication
    const hash = createHash("sha256");

    hash.update(resume.buffer);

    const fileHash = hash.digest("hex");

    console.log(`[FileService] File hash: ${fileHash}`);

    // STEP 3: Check duplicate file
    console.log(
      `[FileService] Checking duplicate for userId: ${userId}, hash: ${fileHash}`,
    );

    const existingFile = await fileRepository.findFileByUserAndHash(
      userId,
      fileHash,
    );

    if (existingFile) {
      console.log(
        `[FileService] Duplicate found. Existing file ID: ${existingFile.id}`,
      );

      return {
        success: true,
        message: "File already exists - deduplication successful",
        data: {
          fileId: existingFile.id,
          fileName: existingFile.getName(),
          filePath: existingFile.getPath(),
          fileHash,
          isDuplicate: true,
        },
      };
    }

    console.log(`[FileService] No duplicate found. Proceeding upload.`);

    // STEP 4: Generate unique object name
    const timestamp = Date.now();

    const uuid = randomUUID().substring(0, 8);

    const fileExtension = originalName.split(".").pop();

    const fileName = `${uuid}-${timestamp}.${fileExtension}`;

    // logical folder structure inside MinIO
    const objectName = `${userId}/${fileName}`;

    console.log(
      `[FileService] Uploading file to MinIO: ${objectName}`,
    );

    // STEP 5: Upload file to MinIO
    await minioClient.putObject(
      process.env.MINIO_BUCKET!,
      objectName,
      resume.buffer,
      resume.size,
      {
        "Content-Type": resume.mimetype,
      },
    );

    console.log(`[FileService] File uploaded to MinIO successfully`);

    // STEP 6: Save metadata in MongoDB
    const fileEntity: CreateFileData = {
      userId: userId,
      name: fileName,
      originalName: originalName,

      // store MinIO object key instead of local filesystem path
      path: objectName,

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

    console.log(
      `[FileService] Upload completed successfully. File ID: ${file.id}`,
    );

    // STEP 7: Return response
    return {
      success: true,
      message: "Resume file uploaded successfully",
      data: {
        fileId: file.id,
        fileName,
        filePath: objectName,
        fileHash,
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