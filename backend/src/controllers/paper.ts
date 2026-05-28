import { Request, Response } from "express";
import fs from "fs";
import { Paper } from "../models/Paper";
import { addPaperJob } from "../queue/producer"; 
import pdfParse = require("pdf-parse");

// We extend the Request type slightly so TypeScript doesn't yell about req.file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
export const createAssignment = async (req: MulterRequest, res: Response): Promise<any> => {
  try {
    // 1. Unpack the flat FormData fields sent from the frontend
    const { subject, grade, dueDate, additionalInfo, questions } = req.body;
    
    // Reconstruct the criteria object for your database
    const criteria = { subject, grade, dueDate, additionalInfo, questions };
    
    let documentContext = "";

    // 2. Safely handle the PDF if one was uploaded
    if (req.file) {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        
        // Parse the text using our clean import
        const pdfData = await pdfParse(dataBuffer);
        documentContext = pdfData.text;
      } catch (parseError) {
        console.error("❌ Failed to extract text from PDF:", parseError);
      } finally {
        // ALWAYS clean up the temporary file, even if parsing fails!
        // This prevents your server from running out of storage space.
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // 3. Save the initial request to MongoDB with 'pending' status
    const newPaper = await Paper.create({
      title: subject ? `Assignment on ${subject}` : "New AI Assignment",
      criteria,
      status: "pending"
    });

    // 4. Add this job to the BullMQ Redis Queue
    await addPaperJob(newPaper._id.toString(), criteria, documentContext);

    // 5. Immediately respond to the frontend so it doesn't freeze
    res.status(202).json({ 
      success: true, 
      message: "Assignment queued for generation",
      paperId: newPaper._id 
    });

  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const paper = await Paper.findById(id);

    if (!paper) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    res.status(200).json({ success: true, paper });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllAssignments = async (req: any, res: any) => {
  try {
    const papers = await Paper.find().select("criteria createdAt _id");
    
    res.status(200).json({
      success: true,
      papers: papers
    });
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assignments" });
  }
};

export const deleteAssignment = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const deletedPaper = await Paper.findByIdAndDelete(id);
    
    if (!deletedPaper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    res.status(200).json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ success: false, message: "Failed to delete assignment" });
  }
};