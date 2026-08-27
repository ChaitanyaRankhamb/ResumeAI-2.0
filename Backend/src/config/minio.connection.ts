import dotenv from "dotenv";
import { Client } from "minio";

dotenv.config();

const minioClient = new Client({
  // Uses MINIO_ENDPOINT env var — set to 'resume_ai_minio' in Docker, 'localhost' locally
  endPoint: process.env.MINIO_ENDPOINT || "localhost",

  // Uses MINIO_PORT env var — set to 9000 in Docker, 9002 locally
  port: Number(process.env.MINIO_PORT || 9002),

  useSSL: false,

  accessKey: process.env.MINIO_ROOT_USER || "minioadmin",

  secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
});

export const connectMinio = async (): Promise<void> => {
  try {
    await minioClient.listBuckets();
    console.log("[MinIO] Connected successfully");

    const bucketName = process.env.MINIO_BUCKET || "resumes";
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`[MinIO] Bucket '${bucketName}' created successfully`);
    }
  } catch (error: any) {
    console.error("[MinIO] Connection failed:", error.message);

    process.exit(1);
  }
};

export default minioClient;