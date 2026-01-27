import express from "express";
import {
  followUser,
  unfollowUser,
  addFavourite,
  removeFavourite,
  toggleFavourite,
  getUserProfile,
  updateUserProfile,
  checkFollowStatus
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/follow/:id", protect, followUser);
router.put("/unfollow/:id", protect, unfollowUser);
router.get("/:id/follow-status", protect, checkFollowStatus);
router.put("/favourites/:id", protect, toggleFavourite); // Use toggle instead of separate add/remove
router.delete("/favourites/:id", protect, removeFavourite); // Keep for backward compatibility
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;
