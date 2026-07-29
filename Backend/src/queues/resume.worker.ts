import { Job, Worker } from "bullmq";
import { queueConnection } from "./queue.config";
import { ResumeAnalysisJobData } from "./job.types";
import { processResumeAnalysisJob } from "../modules/resume/services/resume.worker.service";

export const resumeWorker = new Worker(
  "resume-analysis", // please keep the same name of the queue so worker will picks jobs from the same queue
  async (job: Job<ResumeAnalysisJobData>) => {
    const { fileId, userId } = job.data;

    // The worker executes the resume-processing workflow from the worker service.
    await processResumeAnalysisJob(job, userId, fileId);
  },
  {
    connection: queueConnection, // it will tell to workers where the jobs are stored in redis server
  },
);

// Log the worker lifecycle events so job progress is easier to trace.
resumeWorker.on("progress", (job: Job<ResumeAnalysisJobData>, progress: Object) => {
  console.log(`[resume-worker] Job ${job.id} progress: ${JSON.stringify(progress)} for user ${job.data.userId}`);
});

// Log the worker lifecycle events so job progress is easier to trace.
resumeWorker.on("completed", (job: Job<ResumeAnalysisJobData>) => {
  console.log(`[resume-worker] Job ${job.id} completed successfully for user ${job.data.userId}`);
});

resumeWorker.on("failed", (job: Job<ResumeAnalysisJobData> | undefined, err: Error) => {
  const jobId = job?.id ?? "unknown";
  const userId = job?.data?.userId ?? "unknown";

  console.error(`[resume-worker] Job ${jobId} failed for user ${userId}:`, err.message);
});

resumeWorker.on("error", (err: Error) => {
  console.error("[resume-worker] Worker encountered an error:", err);
});
