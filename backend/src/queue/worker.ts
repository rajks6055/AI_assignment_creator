import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { Paper } from "../models/Paper";
import { generateExamPaper } from "../services/llm";
// Import your Socket.io instance from your main server file!
// (See the note below on how to export this if you haven't already)
import { io } from "../index"; 

export const paperWorker = new Worker("paper-generation", async (job: Job) => {
  // 1. EXTRACTION UPGRADE: Catch the documentContext we sent from the producer
  const { paperId, criteria, documentContext } = job.data;
  
  console.log(`👷 Worker started processing Paper ID: ${paperId}`);
  if (documentContext) console.log(`📄 PDF Context detected! Feeding to AI...`);

  try {
    // Update database to show we are working on it
    await Paper.findByIdAndUpdate(paperId, { status: "processing" });

    console.log(`🧠 Asking AI to generate paper...`);
    
    // 2. LLM UPGRADE: Pass BOTH the criteria and the PDF text to Gemini
    const generatedData = await generateExamPaper(criteria, documentContext);

    // Save the finalized AI paper to the database
    await Paper.findByIdAndUpdate(paperId, {
      status: "completed",
      generatedContent: generatedData
    });

    console.log(`✅ Paper ${paperId} generated and saved successfully!`);
    
    // 3. WEBSOCKET UPGRADE: Tell the frontend the paper is ready!
    if (io) {
      io.emit("paper-ready", { paperId });
    }

  } catch (error) {
    console.error(`❌ Worker failed on Paper ${paperId}:`, error);
    
    // Update DB to show it failed
    await Paper.findByIdAndUpdate(paperId, { status: "failed" });
    
    // Tell the frontend to stop loading and show an error
    if (io) {
      io.emit("paper-failed", { paperId });
    }
    
    throw error;
  }
}, {
  connection: redisConnection as any,
});

paperWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});