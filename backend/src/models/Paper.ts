import mongoose from "mongoose";

const PaperSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled Assignment" },
  status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending" 
  },
  // The original criteria requested by the teacher from the frontend
  criteria: {
    subject: String,        
    grade: String,
    dueDate: String,
    additionalInfo: String,
    questions: Array // the array of question types, counts, and marks
  },
  // The final AI-generated paper
  generatedContent: {
    schoolName: String,
    subject: String,
    className: String,
    timeAllowed: String,
    maxMarks: Number,
    instructions: String,
    sections: Array,
    answerKey: Array
  },
  createdAt: { type: Date, default: Date.now }
});

export const Paper = mongoose.model("Paper", PaperSchema);