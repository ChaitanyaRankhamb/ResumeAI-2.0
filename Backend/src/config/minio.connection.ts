import { Client } from "minio";
import dotenv from "dotenv";

dotenv.config();

const minioClient = new Client({
  // endPoint: process.env.MINIO_ENDPOINT || "resume_ai_minio",
  endPoint: "localhost",

  // internal Docker port
  port: Number(process.env.MINIO_PORT || 9002), // backend is running locally so use localhost:9002

  useSSL: false,

  accessKey: process.env.MINIO_ROOT_USER || "minioadmin",

  secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
});

export const connectMinio = async (): Promise<void> => {
  try {
    await minioClient.listBuckets();

    console.log("[MinIO] Connected successfully"); 
  } catch (error: any) {
    console.error("[MinIO] Connection failed:", error.message);

    process.exit(1);
  }
};

export default minioClient;