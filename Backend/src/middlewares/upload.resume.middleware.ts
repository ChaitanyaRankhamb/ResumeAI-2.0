import multer from "multer";

// Use memory storage so file is available as buffer
const storage = multer.memoryStorage();

export const uploadResumeMiddleware = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
}).single("resume"); // "resume" = frontend field name