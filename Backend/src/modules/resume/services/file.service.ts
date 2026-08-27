import { createHash, randomUUID } from "crypto";
import minioClient from "../../../config/minio.connection";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { CreateFileData } from "../../../entities/files/fileRepo";
import { UserId } from "../../../entities/user/userId";

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
      `[STORAGE:FILE] Starting file ingestion for user: ${userId}, file: "${originalName}"`,
    );

    // STEP 2: Generate SHA-256 hash for deduplication
    const hash = createHash("sha256");

    hash.update(resume.buffer);

    const fileHash = hash.digest("hex");

    console.log(`[STORAGE:HASH] Computed SHA-256 hash: ${fileHash}`);

    // Ensure the generated hash is structurally valid (64-character SHA-256 hex string)
    if (!fileHash || fileHash.length !== 64) {
      console.error(`[STORAGE:HASH] Invalid SHA-256 hash generated: ${fileHash}`);
      return {
        success: false,
        message: "Invalid or empty file hash generated. Upload aborted.",
      };
    }

    // STEP 3: Check duplicate file
    console.log(
      `[DB:MONGODB] Checking duplicate file record for userId: ${userId}, hash: ${fileHash}`,
    );

    const existingFile = await fileRepository.findFileByUserAndHash(
      userId,
      fileHash,
    );

    if (existingFile) {
      console.log(
        `[DB:MONGODB] Duplicate file detected. Existing file ID: ${existingFile.id}`,
      );

      const bucketName = process.env.MINIO_BUCKET || "resumes";
      const targetPath = existingFile.getPath();

      // Self-healing: verify the file actually exists in MinIO storage.
      // If MinIO was restarted or cleared, re-upload the buffer so the worker can process it.
      try {
        await minioClient.statObject(bucketName, targetPath);
        console.log(`[STORAGE:MINIO] Verified file exists in MinIO: "${targetPath}"`);
      } catch (statError: any) {
        console.warn(
          `[STORAGE:MINIO] File missing in MinIO for duplicate record ("${targetPath}"). Restoring buffer to MinIO...`,
        );
        await minioClient.putObject(
          bucketName,
          targetPath,
          resume.buffer,
          resume.size,
          {
            "Content-Type": resume.mimetype,
          },
        );
        console.log(`[STORAGE:MINIO] Successfully restored file buffer to MinIO: "${targetPath}"`);
      }

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

    console.log(`[DB:MONGODB] No duplicate found. Proceeding with object storage upload.`);

    // STEP 4: Generate unique object name
    const timestamp = Date.now();

    const uuid = randomUUID().substring(0, 8);

    const fileExtension = originalName.split(".").pop();

    const fileName = `${uuid}-${timestamp}.${fileExtension}`;

    // logical folder structure inside MinIO
    const objectName = `${userId}/${fileName}`;

    console.log(
      `[STORAGE:MINIO] Uploading buffer to MinIO bucket: "${process.env.MINIO_BUCKET || "resumes"}", path: "${objectName}"`,
    );

    // STEP 5: Upload file to MinIO
    const bucketName = process.env.MINIO_BUCKET || "resumes";
    await minioClient.putObject(
      bucketName,
      objectName,
      resume.buffer,
      resume.size,
      {
        "Content-Type": resume.mimetype,
      },
    );

    console.log(`[STORAGE:MINIO] MinIO upload successful for object: "${objectName}"`);

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

    console.log(`[DB:MONGODB] Creating new File record in MongoDB...`);

    const file = await fileRepository.createFile(fileEntity);

    if (!file) {
      console.error(`[DB:MONGODB] Failed to create File document in MongoDB`);
      return {
        success: false,
        message: "Failed to save file metadata to database",
      };
    }

    console.log(
      `[DB:MONGODB] File metadata stored successfully. File ID: ${file.id}`,
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
    console.error(`[STORAGE:FILE] Error in resumeFileService: ${err.message}`);

    return {
      success: false,
      message: `Error uploading resume: ${err.message}`,
    };
  }
};
