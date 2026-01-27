import express from 'express'
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
  likeBlog,
  commentBlog,
  getTrendingBlogs,
  getLatestBlogs,
  replyToComment,
  addEmojiReaction
} from '../controllers/blogController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📌 Create a new blog (protected)
router.post('/create', protect, createBlog)

// ✏️ Update a blog (protected)
router.put('/:id', protect, updateBlog)

// 🗑️ Delete a blog (protected)
router.delete('/:id', protect, deleteBlog)

// 📚 Get all blogs
router.get('/', getAllBlogs)

// 🔥 Get trending blogs (public)
router.get('/trending', getTrendingBlogs)

// 🆕 Get latest blogs (public)
router.get('/latest', getLatestBlogs)

// 🔍 Get a single blog
router.get('/:id', protect, getSingleBlog)

// ❤️ Like or Unlike a blog (Protected)
router.put('/:id/like', protect, likeBlog)

// 💬 Comment on a blog (protected)
router.post('/:id/comment', protect, commentBlog)

router.post('/:blogId/comments/:commentId/reply', protect, replyToComment) // reply

router.post('/:blogId/comments/:commentId/emoji', protect, addEmojiReaction) // emoji

export default router
