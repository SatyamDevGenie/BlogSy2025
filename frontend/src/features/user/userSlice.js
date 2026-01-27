import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../utils/api";

// =======================
// Async Thunks
// =======================

// 👤 Get User Profile
export const getUserProfile = createAsyncThunk(
  "user/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await userAPI.getProfile();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);

// 👥 Follow User
export const followUser = createAsyncThunk(
  "user/follow",
  async (userId, thunkAPI) => {
    try {
      const res = await userAPI.follow(userId);
      return { userId, message: res.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to follow user"
      );
    }
  }
);

// 👥 Unfollow User
export const unfollowUser = createAsyncThunk(
  "user/unfollow",
  async (userId, thunkAPI) => {
    try {
      const res = await userAPI.unfollow(userId);
      return { userId, message: res.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to unfollow user"
      );
    }
  }
);

// ⭐ Toggle Favorite (backend PUT /users/favourites/:id returns { message, isFavorited, favorites })
export const toggleFavourite = createAsyncThunk(
  "user/toggleFavorite",
  async (blogId, thunkAPI) => {
    try {
      const res = await userAPI.addToFavorites(blogId);
      return {
        blogId,
        isFavorited: res.data?.isFavorited ?? true,
        favorites: res.data?.favorites ?? [],
        message: res.data?.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update favorites"
      );
    }
  }
);

// ⭐ Add to Favorites (alias – calls same toggle endpoint)
export const addToFavorites = createAsyncThunk(
  "user/addFavorite",
  async (blogId, thunkAPI) => {
    try {
      const res = await userAPI.addToFavorites(blogId);
      return {
        blogId,
        isFavorited: res.data?.isFavorited ?? true,
        favorites: res.data?.favorites ?? [],
        message: res.data?.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add to favorites"
      );
    }
  }
);

// ⭐ Remove from Favorites
export const removeFromFavorites = createAsyncThunk(
  "user/removeFavorite",
  async (blogId, thunkAPI) => {
    try {
      await userAPI.removeFromFavorites(blogId);
      return { blogId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove from favorites"
      );
    }
  }
);

// 🔍 Check Follow Status
export const checkFollowStatus = createAsyncThunk(
  "user/checkFollowStatus",
  async (userId, thunkAPI) => {
    try {
      const res = await userAPI.checkFollowStatus(userId);
      return { userId, isFollowing: res.data.isFollowing };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to check follow status"
      );
    }
  }
);

// =======================
// User Slice
// =======================
const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    followStatus: {},
    favorites: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    resetUser: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    clearProfile: (state) => {
      state.profile = null;
      state.followStatus = {};
      state.favorites = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload; // { user, blogs }
        const favs = action.payload?.user?.favourites || [];
        state.favorites = Array.isArray(favs) ? favs.map((b) => (typeof b === "object" ? b._id : b)) : [];
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.followStatus[action.payload.userId] = true;
        state.message = action.payload.message;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })

      // Unfollow User
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.followStatus[action.payload.userId] = false;
        state.message = action.payload.message;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })

      // Add to Favorites / Toggle
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isSuccess = true;
        if (Array.isArray(action.payload.favorites)) {
          state.favorites = action.payload.favorites.map((id) => id?.toString?.() || id);
        } else if (action.payload.isFavorited && action.payload.blogId) {
          if (!state.favorites.includes(action.payload.blogId)) {
            state.favorites.push(action.payload.blogId);
          }
        }
        state.message = action.payload.message;
      })
      .addCase(toggleFavourite.fulfilled, (state, action) => {
        state.isSuccess = true;
        if (Array.isArray(action.payload.favorites)) {
          state.favorites = action.payload.favorites.map((id) => id?.toString?.() || id);
        } else {
          const id = action.payload.blogId;
          if (action.payload.isFavorited) {
            if (!state.favorites.includes(id)) state.favorites.push(id);
          } else {
            state.favorites = state.favorites.filter((f) => f !== id && f !== id?.toString?.());
          }
        }
        state.message = action.payload?.message;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })

      // Remove from Favorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.favorites = state.favorites.filter((id) => id !== action.payload.blogId && id !== action.payload.blogId?.toString?.());
        state.message = "Removed from favorites";
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })

      // Check Follow Status
      .addCase(checkFollowStatus.fulfilled, (state, action) => {
        state.followStatus[action.payload.userId] = action.payload.isFollowing;
      });
  },
});

// Export actions & reducer
export const { resetUser, clearProfile } = userSlice.actions;
export default userSlice.reducer;