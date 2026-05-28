import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Notice we added the optional documentContext string here!
export const generateExamPaper = async (criteria: any, documentContext?: string) => {
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  // Constructing a highly specific, professional prompt
  let prompt = `
    You are an elite academic assessment designer. Your task is to generate a high-quality, perfectly formatted exam paper based on the exact parameters provided.

    =========================================
    EXAM PARAMETERS
    =========================================
    Subject: ${criteria.subject}
    Grade/Class: ${criteria.grade}
    Due Date / Date: ${criteria.dueDate}
    Target Question Types & Counts: ${criteria.questions}
    Additional Professor Instructions: ${criteria.additionalInfo || "None"}

    =========================================
    RULES FOR GENERATION
    =========================================
    1. You MUST strictly follow the "Target Question Types & Counts". If it asks for 5 Multiple Choice and 2 Long Answer, you must generate exactly that amount.
    2. Ensure the difficulty is highly appropriate for the specified Grade/Class.
    3. The maxMarks must equal the total sum of all question marks combined.
    4. Group similar question types into distinct "Sections" (e.g., Section A: Objective, Section B: Descriptive).
  `;

  // Inject the PDF reference material if the user uploaded one
  if (documentContext) {
    prompt += `
    =========================================
    CRITICAL: REFERENCE MATERIAL (PDF SOURCE)
    =========================================
    The user has provided the following syllabus/study material. 
    
    ABSOLUTE RULE: You MUST base EVERY SINGLE QUESTION strictly on the concepts, facts, and vocabulary found in the text below. 
    If a concept is not explicitly mentioned in this text, DO NOT ask a question about it. 
    Pretend you have zero outside knowledge of this subject. 
    
    TEXT SOURCE:
    ${documentContext}
    `;
  }

  // Finally, give it the exact JSON schema to adhere to
  prompt += `
    =========================================
    OUTPUT SCHEMA
    =========================================
    Return the exam using exactly this JSON structure. Do not deviate.
    {
      "schoolName": "Generic High School",
      "subject": "The exact subject",
      "className": "The exact grade/class",
      "timeAllowed": "Estimate appropriate time (e.g., '2 Hours')",
      "maxMarks": 100,
      "instructions": "3-4 concise general instructions for the student",
      "sections": [
        {
          "title": "Section A: Multiple Choice",
          "instruction": "Specific instructions for this section",
          "questions": [
            { "id": 1, "text": "Question text here?", "difficulty": "Easy", "marks": 2 }
          ]
        }
      ],
      "answerKey": [
        "1. Correct answer or detailed rubric here",
        "2. Correct answer or detailed rubric here"
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    
    const jsonText = result.response.text();
    
    return JSON.parse(jsonText); 
    
  } catch (error) {
    console.error("❌ AI Generation Failed:", error);
    throw new Error("Failed to generate paper");
  }
};