import { Router } from "express";
import multer from "multer";
import { createAssignment, getAssignment, getAllAssignments, deleteAssignment } from "../controllers/paper"; 

const router = Router();

// 1. Initialize multer FIRST
const upload = multer({ dest: "uploads/" }); 

// 2. GET ALL: Fetches every paper for the dashboard grid
router.get("/", getAllAssignments); 

// 3. CREATE: Generates a new paper (ONLY ONE POST ROUTE HERE!)
router.post("/generate", upload.single("file"), createAssignment);

// 4. GET ONE: Fetches a single paper when you click "View Assignment"
router.get("/:id", getAssignment); 

// 5. DELETE: Removes a paper
router.delete("/:id", deleteAssignment);

export default router;