import Blog from "../models/Blog.js";
import User from "../models/User.js";

// 📌 Create Blog with enhanced features
const createBlog = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      image, 
      category, 
      tags, 
      status, 
      excerpt,
      metaTitle,
      metaDescription 
    } = req.body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    let finalSlug = slug;
    if (existingBlog) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const blog = new Blog({
      title,
      slug: finalSlug,
      content,
      excerpt,
      image: image || '',
      author: req.user._id,
      category: category || 'Other',
      tags: tags || [],
      status: status || 'published',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      publishedAt: status === 'published' ? new Date() : undefined
    });

    const createdBlog = await blog.save();

    // Populate author information
    const populatedBlog = await createdBlog.populate("author", "_id username avatar");

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating blog", 
      error: error.message 
    });
  }
};

// ✏️ Update Blog
const updateBlog = async (req, res) => {
  const { title, content, image } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // 🛡️ Check if the logged-in user is the blog's author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message:
          "You're not allowed to edit this blog. Only the author can update it.",
      });
    }

    // ✏️ Update the fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = image !== undefined ? image : blog.image;

    const updatedBlog = await blog.save();
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating blog",
      error: error.message,
    });
  }
};

// 🗑️ Delete Blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message:
          "You're not allowed to delete this blog. Only the author can delete it.",
      });
    }

    await blog.deleteOne();

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting blog",
      error: error.message,
    });
  }
};

// 📚 Get All Blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "_id username") // 👤 Include author info
      .sort({ createdAt: -1 }); // 🕒 Newest first

    res.json(blogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching blogs", error });
  }
};

// 🔍 Get Single Blog
const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "_id username") // 👤 Author
      .populate("comments.user", "_id username") // 💬 Comment users
      .populate("viewedBy", "_id username"); // 👁️ Viewers

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user?._id;

    if (userId && !blog.viewedBy.some((user) => user._id.equals(userId))) {
      blog.views += 1;
      blog.viewedBy.push(userId);
      await blog.save();
    }

    res.json({ success: true, blog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching blog", error });
  }
};

// ❤️ Like / Unlike Blog
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user._id;

    if (!blog.likes.includes(userId)) {
      blog.likes.push(userId);
    } else {
      blog.likes.pull(userId);
    }

    await blog.save();

    // Fetch updated blog with usernames of liked users
    const updatedBlog = await Blog.findById(req.params.id)
      .populate("likes", "_id username") // 👈 This adds username in the likes array
      .populate("author", "_id username");

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error while liking blog", error });
  }
};

// 💬 Comment on Blog
const commentBlog = async (req, res) => {
  const { comment } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.comments.push({
      user: req.user._id,
      comment,
    });

    await blog.save();

    // Refetch blog and populate comments' user with username
    const updatedBlog = await Blog.findById(req.params.id).populate(
      "comments.user",
      "username"
    );

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error while commenting", error });
  }
};

const getTrendingBlogs = async (req, res) => {
  try {
    // Trending Blogs :- Sort by views descending
    const trendingByViews = await Blog.find()
      .populate("author", "_id username")
      .sort({ views: -1, createdAt: -1 })
      .limit(10);

    res.json(trendingByViews); // or trendingByViews
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching trending blogs", error });
  }
};

// 🆕 Get Latest Blogs (most recently created)
const getLatestBlogs = async (req, res) => {
  try {
    const latestBlogs = await Blog.find()
      .populate("author", "_id username")
      .sort({ createdAt: -1 }) // newest first
      .limit(10); // limit results

    res.json(latestBlogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching latest blogs", error });
  }
};


// 💬 Reply to a comment
const replyToComment = async (req, res) => {
  const { blogId, commentId } = req.params;
  const { comment } = req.body;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const commentToReply = blog.comments.id(commentId);
    if (!commentToReply)
      return res.status(404).json({ message: "Comment not found" });

    commentToReply.replies.push({
      user: req.user._id,
      comment,
    });

    await blog.save();

    const updatedBlog = await Blog.findById(blogId).populate([
      { path: "comments.user", select: "username" },
      { path: "comments.replies.user", select: "username" },
    ]);

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Error replying to comment", error });
  }
};


// 😀 React with emoji to a comment or reply
const addEmojiReaction = async (req, res) => {
  const { blogId, commentId } = req.params;
  const { replyId, emoji } = req.body; // replyId is optional

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const targetComment = blog.comments.id(commentId);
    if (!targetComment)
      return res.status(404).json({ message: "Comment not found" });

    if (replyId) {
      // react to reply
      const targetReply = targetComment.replies.id(replyId);
      if (!targetReply)
        return res.status(404).json({ message: "Reply not found" });

      targetReply.emojis.push({ user: req.user._id, emoji });
    } else {
      // react to main comment
      targetComment.emojis.push({ user: req.user._id, emoji });
    }

    await blog.save();

    const updatedBlog = await Blog.findById(blogId).populate([
      { path: "comments.user", select: "username" },
      { path: "comments.replies.user", select: "username" },
    ]);

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Error adding emoji", error });
  }
};





export {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getTrendingBlogs,
  getLatestBlogs,
  getSingleBlog,
  likeBlog,
  commentBlog,
  replyToComment,
  addEmojiReaction
};
