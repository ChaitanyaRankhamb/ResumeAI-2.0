import { Response } from "express";
import { Queue, QueueEvents } from "bullmq";
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

  // Send current progress immediately
  const job = await queue.getJob(jobId);

  // If the job exists, send its current progress to the client
  if (job) {
    sendSseEvent(res, job.progress as ResumeProgressPayload);
  }

  // Listen for future progress updates
  queueEvents.on("progress", ({ jobId: id, data }) => {
    if (id !== jobId) return;

    sendSseEvent(res, data as ResumeProgressPayload);
  });

  // Close when completed
  queueEvents.on("completed", ({ jobId: id }) => {
    if (id !== jobId) return;

    res.end();
  });

  // Close when failed
  queueEvents.on("failed", ({ jobId: id }) => {
    if (id !== jobId) return;

    res.end();
  });

  res.on("close", async () => {
    await queueEvents.close();
    await queue.close();
  });
};