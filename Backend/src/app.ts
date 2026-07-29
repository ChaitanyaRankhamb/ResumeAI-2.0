import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import passport from "passport";
import { connectMinio } from "./config/minio.connection";
import connectDB from "./config/mongo.connection";
import "./config/passport.config"; // Initialize passport configuration
import { redisConnection } from "./config/redis.connection";
import { errorHandler } from "./middlewares/errorHandling.middleware";
import checkUsernameRouter from "./modules/checkUsername/checkUsername.route";
import resumeRouter from "./modules/resume/resume.routes";
import userRouter from "./modules/user/user.routes";
import verifyRouter from "./modules/verify/verify.route";
import reportPdfRoutes from "./routes/report-pdf";
import resumeProgressRouter from "./modules/resume/resume.progress.route";

// Create a new express application instance
const app = express();

// connect the mongoDB database
connectDB();

// connect the redis client here
redisConnection();

// connect the minio client here
connectMinio();

// connect the frontend with backend using cors middleware
const corsOptions = {
  origin: [
    "http://localhost:3000",   // local frontend dev
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost",        // nginx on port 80 (Docker)
    "http://127.0.0.1",       // nginx on port 80 (Docker)
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions)); // connect with cors

// Cookie Parser Middleware
app.use(cookieParser());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // initialize the passport middleware

// Routes
app.use("/auth", userRouter);
app.use("/verify", verifyRouter);
app.use("/check-username", checkUsernameRouter);
app.use("/upload-resume", resumeRouter);
app.use("/resume", resumeRouter); // Add this for GET endpoints
app.use("/resume/progress", resumeProgressRouter);
app.use("/report", reportPdfRoutes);

// Set the network port
const port = process.env.PORT || 5000;

// Define the root path with a greeting message
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the ResumeAI Platform!" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// use the error handling middleware
app.use(errorHandler);

// Start the Express server
app.listen(Number(port), "0.0.0.0", () => {
  console.log(`The server is running at port ${port}`);
});
