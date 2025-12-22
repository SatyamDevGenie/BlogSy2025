// 📦 Import dependencies
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

// 🛣 Initialize router
const router = express.Router();

// 📝 Route to register user
router.post("/register", registerUser);

// 🔑 Route to login user
router.post("/login", loginUser);

// 🚪 Route to logout user (protected)
router.post("/logout", protect, logoutUser);

// ✅ Route to verify email
router.get("/verify-email/:token", verifyEmail);

// 🔄 Route to refresh access token
router.post("/refresh-token", refreshToken);

// 🔐 Route to request password reset
router.post("/forgot-password", forgotPassword);

// 🔄 Route to reset password
router.post("/reset-password/:token", resetPassword);

// 👤 Route to get current user (protected)
router.get("/me", protect, getCurrentUser);

// 📤 Export the router
export default router;
