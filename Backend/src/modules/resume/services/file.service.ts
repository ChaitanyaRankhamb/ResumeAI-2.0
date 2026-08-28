import { createHash, randomUUID } from "crypto";
import logger from "../../../config/logger.config";
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
  const log = logger.child({ module: "RESUME:STORAGE", service: "resumeFileService" });

  try {
    // STEP 1: Validate uploaded file
    if (!resume || !resume.buffer) {
      log.warn({ userId: userId.toString() }, "Empty file buffer received");
      return {
        success: false,
        message: "No file provided or file buffer is empty",
      };
    }

    const originalName = resume.originalname;
    const userIdStr = userId.toString();

    log.debug(
      { userId: userIdStr, fileName: originalName },
      "Starting file ingestion & hashing",
    );

    // STEP 2: Generate SHA-256 hash for deduplication
    const hash = createHash("sha256");
    hash.update(resume.buffer);
    const fileHash = hash.digest("hex");

    log.debug({ userId: userIdStr, fileHash }, "Computed SHA-256 hash");

    // Ensure the generated hash is structurally valid (64-character SHA-256 hex string)
    if (!fileHash || fileHash.length !== 64) {
      log.error({ userId: userIdStr, fileHash }, "Invalid SHA-256 hash generated");
      return {
        success: false,
        message: "Invalid or empty file hash generated. Upload aborted.",
      };
    }

    // STEP 3: Check duplicate file
    log.debug({ userId: userIdStr, fileHash }, "Checking for duplicate file in database");

    const existingFile = await fileRepository.findFileByUserAndHash(
      userId,
      fileHash,
    );

    if (existingFile) {
      log.info(
        { userId: userIdStr, fileId: existingFile.id, fileHash },
        "Duplicate file detected (Deduplication match)",
      );

      const bucketName = process.env.MINIO_BUCKET || "resumes";
      const targetPath = existingFile.getPath();

      // Self-healing: verify the file actually exists in MinIO storage.
      try {
        await minioClient.statObject(bucketName, targetPath);
        log.debug({ bucketName, targetPath }, "Verified existing file presence in MinIO");
      } catch (statError: any) {
        log.warn(
          { bucketName, targetPath },
          "File missing in MinIO for duplicate record. Restoring buffer to MinIO",
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
        log.info({ bucketName, targetPath }, "Successfully restored file buffer to MinIO");
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

    // STEP 4: Generate unique object name
    const timestamp = Date.now();
    const uuid = randomUUID().substring(0, 8);
    const fileExtension = originalName.split(".").pop();
    const fileName = `${uuid}-${timestamp}.${fileExtension}`;

    // logical folder structure inside MinIO
    const objectName = `${userIdStr}/${fileName}`;
    const bucketName = process.env.MINIO_BUCKET || "resumes";

    log.debug(
      { bucketName, objectName, size: resume.size },
      "Uploading file buffer to MinIO storage",
    );

    // STEP 5: Upload file to MinIO
    await minioClient.putObject(
      bucketName,
      objectName,
      resume.buffer,
      resume.size,
      {
        "Content-Type": resume.mimetype,
      },
    );

    log.info({ bucketName, objectName }, "MinIO object upload completed");

    // STEP 6: Save metadata in MongoDB
    const fileEntity: CreateFileData = {
      userId: userId,
      name: fileName,
      originalName: originalName,
      path: objectName,
      size: resume.size,
      format: resume.mimetype,
      hash: fileHash,
      uploadedAt: new Date(),
    };

    log.debug({ userId: userIdStr, fileName }, "Saving file metadata to MongoDB");
    const file = await fileRepository.createFile(fileEntity);

    if (!file) {
      log.error({ userId: userIdStr, fileName }, "Failed to create File document in MongoDB");
      return {
        success: false,
        message: "Failed to save file metadata to database",
      };
    }

    log.info(
      { fileId: file.id, userId: userIdStr, fileName, fileHash },
      "File metadata stored in MongoDB successfully",
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
    log.error(
      { err, message: err.message, userId: userId.toString() },
      "Error during file ingestion and storage",
    );

    return {
      success: false,
      message: `Error uploading resume: ${err.message}`,
    };
  }
};

