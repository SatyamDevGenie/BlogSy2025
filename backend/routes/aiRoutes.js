import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { writingAssist } from "../controllers/aiController.js";

const router = express.Router();

// All AI routes require authentication
router.use(protect);

router.post("/writing-assist", writingAssist);

export default router;
