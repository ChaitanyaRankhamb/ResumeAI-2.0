import express, { Request, Response } from "express";
import passport from "passport";
import connectDB from "./config/mongo.connection";
import "./config/passport.config"; // Initialize passport configuration
import { errorHandler } from "./middlewares/errorHandling.middleware";
import userRouter from "./modules/user/user.routes";
import verifyRouter from "./modules/verify/verify.route";
import resumeRouter from "./modules/resume/resume.routes";
import checkUsernameRouter from "./modules/checkUsername/checkUsername.route";
import { redisConnection } from "./config/redis.connection";
import cors from "cors";

// Create a new express application instance
const app = express();

// connect the mongoDB database
connectDB();

// connect the redis client here
redisConnection();

// connect the frontend with backend using cors middleware
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // allow frontend
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, // allow cookies/auth headers
};

app.use(cors(corsOptions)); // connect with cors

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // initialize the passport middleware

// Routes
app.use("/auth", userRouter);
app.use("/verify", verifyRouter);
app.use("/check-username", checkUsernameRouter);
app.use("/upload-resume", resumeRouter);

// Set the network port
const port = process.env.PORT || 5000;

// Define the root path with a greeting message
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Walefare Schemes Platform!" });
});

// use the error handling middleware
app.use(errorHandler);

// Start the Express server
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
