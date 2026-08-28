import { Queue, QueueEvents } from "bullmq";
import { Response } from "express";
import logger from "../../../config/logger.config";
import { queueConnection } from "../../../queues/queue.config";
import { ResumeProgressPayload } from "./resume.worker.service";

const QUEUE_NAME = "resume-analysis";

// Helper function to send SSE events to the controller
const sendSseEvent = (res: Response, payload: ResumeProgressPayload) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

export const resumeProgressService = async (
  jobId: string,
  res: Response,
): Promise<void> => {
  const log = logger.child({ module: "RESUME:SSE", service: "resumeProgressService" });
  log.info({ jobId }, "SSE connection stream opened for job progress");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Create a BullMQ queue and queue events instance for the resume analysis queue
  const queue = new Queue(QUEUE_NAME, {
    connection: queueConnection,
  });

  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: queueConnection,
  });

  // Wait for the queue events to be ready before proceeding
  await queueEvents.waitUntilReady();

  // get the Job object from the queue using the provided jobId
  const job = await queue.getJob(jobId);

  // If the job exists, send its current progress to the client
  if (job) {
    log.debug({ jobId, progress: job.progress }, "Sending initial job progress to SSE client");
    sendSseEvent(res, job.progress as ResumeProgressPayload);
  }

  // Listen for future progress updates
  queueEvents.on("progress", ({ jobId: id, data }) => {
    if (id !== jobId) return;

    log.debug({ jobId, progressData: data }, "Streaming progress update via SSE");
    sendSseEvent(res, data as ResumeProgressPayload);
  });

  // Close when completed
  queueEvents.on("completed", ({ jobId: id }) => {
    if (id !== jobId) return;

    log.info({ jobId }, "Job execution completed, closing SSE stream");
    res.end();
  });

  // Close when failed
  queueEvents.on("failed", ({ jobId: id, failedReason }) => {
    if (id !== jobId) return;

    log.error({ jobId, failedReason }, "Job execution failed, closing SSE stream");
    res.end();
  });

  res.on("close", async () => {
    log.info({ jobId }, "Client disconnected from SSE stream, closing queue listeners");
    await queueEvents.close();
    await queue.close();
  });
};