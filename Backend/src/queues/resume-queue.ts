import { Queue } from 'bullmq';
import { queueConnection } from './queue.config';

export const resumeQueue = new Queue('resume-analysis', {
  connection: queueConnection,
});