import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { blogAPI } from "../../utils/api";

// =======================
// Async Thunks
// =======================

// 📥 Fetch All Blogs
export const fetchBlogs = createAsyncThunk(
  "blog/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await blogAPI.getAll();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch blogs"
      );
    }
  }
);

// ✍️ Create a Blog
export const createBlog = createAsyncThunk(
  "blog/create",
  async (formData, thunkAPI) => {
    try {
      const res = await blogAPI.create(formData);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create blog"
      );
    }
  }
);

// ✏️ Update a Blog
export const updateBlog = createAsyncThunk(
  "blog/update",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await blogAPI.update(id, formData);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update blog"
      );
    }
  }
);

// 💬 Comment on Blog
export const commentOnBlog = createAsyncThunk(
  "blog/comment",
  async ({ blogId, comment }, thunkAPI) => {
    try {
      const res = await blogAPI.comment(blogId, { comment });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to comment on blog"
      );
    }
  }
);

// 📈 Fetch Trending Blogs
export const fetchTrendingBlogs = createAsyncThunk(
  "blog/fetchTrending",
  async (_, thunkAPI) => {
    try {
      const res = await blogAPI.getTrending();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch trending blogs"
      );
    }
  }
);

// 🆕 Fetch Latest Blogs
export const fetchLatestBlogs = createAsyncThunk(
  "blog/fetchLatest",
  async (_, thunkAPI) => {
    try {
      const res = await blogAPI.getLatest();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch latest blogs"
      );
    }
  }
);

// 🔍 Fetch Single Blog
export const fetchSingleBlog = createAsyncThunk(
  "blog/fetchSingle",
  async (blogId, thunkAPI) => {
    try {
      const res = await blogAPI.getById(blogId);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch blog"
      );
    }
  }
);

// ❤️ Like/Unlike Blog
export const likeBlog = createAsyncThunk(
  "blog/like",
  async (blogId, thunkAPI) => {
    try {
      const res = await blogAPI.like(blogId);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like blog"
      );
    }
  }
);

// 🗑️ Delete Blog
export const deleteBlog = createAsyncThunk(
  "blog/delete",
  async (blogId, thunkAPI) => {
    try {
      await blogAPI.delete(blogId);
      return blogId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete blog"
      );
    }
  }
);

// =======================
// Blog Slice
// =======================
const blogSlice = createSlice({
  name: "blog",
  initialState: {
    blogs: [],
    currentBlog: null,
    trendingBlogs: [],
    latestBlogs: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    resetBlog: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📥 Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ✍️ Create Blog
      .addCase(createBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogs.unshift(action.payload); // Add new blog at the top
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ✏️ Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogs = state.blogs.map((blog) =>
          blog._id === action.payload._id ? action.payload : blog
        );
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // 💬 Comment on Blog
      .addCase(commentOnBlog.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.blogs = state.blogs.map((blog) =>
          blog._id === action.payload._id ? action.payload : blog
        );
      })
      .addCase(commentOnBlog.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // 📈 Trending Blogs
      .addCase(fetchTrendingBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTrendingBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trendingBlogs = action.payload;
      })
      .addCase(fetchTrendingBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // 🆕 Fetch Latest Blogs
      .addCase(fetchLatestBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLatestBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.latestBlogs = action.payload;
      })
      .addCase(fetchLatestBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // 🔍 Fetch Single Blog
      .addCase(fetchSingleBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSingleBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentBlog = action.payload;
      })
      .addCase(fetchSingleBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ❤️ Like Blog
      .addCase(likeBlog.fulfilled, (state, action) => {
        state.isSuccess = true;
        // Update the blog in all relevant arrays
        const updatedBlog = action.payload;
        state.blogs = state.blogs.map((blog) =>
          blog._id === updatedBlog._id ? updatedBlog : blog
        );
        state.trendingBlogs = state.trendingBlogs.map((blog) =>
          blog._id === updatedBlog._id ? updatedBlog : blog
        );
        state.latestBlogs = state.latestBlogs.map((blog) =>
          blog._id === updatedBlog._id ? updatedBlog : blog
        );
        if (state.currentBlog && state.currentBlog._id === updatedBlog._id) {
          state.currentBlog = updatedBlog;
        }
      })
      .addCase(likeBlog.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })

      // 🗑️ Delete Blog
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.isSuccess = true;
        const deletedBlogId = action.payload;
        state.blogs = state.blogs.filter((blog) => blog._id !== deletedBlogId);
        state.trendingBlogs = state.trendingBlogs.filter((blog) => blog._id !== deletedBlogId);
        state.latestBlogs = state.latestBlogs.filter((blog) => blog._id !== deletedBlogId);
        if (state.currentBlog && state.currentBlog._id === deletedBlogId) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

// Export actions & reducer
export const { resetBlog, clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;
