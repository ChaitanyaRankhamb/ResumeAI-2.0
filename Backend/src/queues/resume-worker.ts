import { Job, Worker } from "bullmq";
import { queueConnection } from "./queue.config";
import { ResumeAnalysisJobData } from "./job.types";
import { processResumeAnalysisJob } from "../modules/resume/services/resume.worker.service";

export const resumeWorker = new Worker(
  "resume-analysis", // please keep the same name of the queue so worker will picks jobs from the same queue
  async (job: Job<ResumeAnalysisJobData>) => {
    const { fileId, userId } = job.data;
    console.log(`[WORKER:BULLMQ] Worker picked up job ${job.id} (fileId: ${fileId}, userId: ${userId})`);

    // The worker executes the resume-processing workflow from the worker service.
    await processResumeAnalysisJob(job, userId, fileId);
  },
  {
    connection: queueConnection, // it will tell to workers where the jobs are stored in redis server
  },
);

// Log the worker lifecycle events so job progress is easier to trace.
resumeWorker.on("progress", (job: Job<ResumeAnalysisJobData>, progress: Object) => {
  console.log(`[WORKER:BULLMQ] Job ${job.id} progress: ${JSON.stringify(progress)} (userId: ${job.data.userId})`);
});

// Log the worker lifecycle events so job progress is easier to trace.
resumeWorker.on("completed", (job: Job<ResumeAnalysisJobData>) => {
  console.log(`[WORKER:BULLMQ] Job ${job.id} COMPLETED successfully for user: ${job.data.userId}`);
});

resumeWorker.on("failed", (job: Job<ResumeAnalysisJobData> | undefined, err: Error) => {
  const jobId = job?.id ?? "unknown";
  const userId = job?.data?.userId ?? "unknown";

  console.error(`[WORKER:BULLMQ] Job ${jobId} FAILED for user ${userId}:`, err.message);
});

resumeWorker.on("error", (err: Error) => {
  console.error("[WORKER:BULLMQ] Worker connection encountered an error:", err);
});