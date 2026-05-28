import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

// Create a new queue named 'paper-generation'
export const paperQueue = new Queue("paper-generation", {
  connection: redisConnection as any,
});

// Function to add a job to the queue
export const addPaperJob = async (paperId: string, criteria: any,documentContext?: string) => {
  console.log(`📥 Adding Job to Queue for Paper ID: ${paperId}`);
  
  await paperQueue.add("generate", {
    paperId,
    criteria,
    documentContext
  }, {
    jobId: paperId 
  });
};