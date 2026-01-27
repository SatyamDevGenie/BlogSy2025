import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI, userAPI } from "../../utils/api";

// Get user from localStorage
const user = JSON.parse(localStorage.getItem("user"));

// =======================
// Async Thunks
// =======================

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await authAPI.login(userData);
      const userWithToken = res.data;
      localStorage.setItem("user", JSON.stringify(userWithToken));
      return userWithToken;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Register – backend returns { message, user: { _id, username, email, isEmailVerified, token } }
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const res = await authAPI.register(userData);
      const userWithToken = res.data?.user || res.data;
      if (!userWithToken?.token) {
        throw new Error("Invalid registration response");
      }
      localStorage.setItem("user", JSON.stringify(userWithToken));
      return userWithToken;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "auth/logout", 
  async (_, thunkAPI) => {
    try {
      await authAPI.logout();
      localStorage.removeItem("user");
      return null;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem("user");
      return null;
    }
  }
);

// Update Profile – backend returns { message, user: { _id, username, email, isAdmin } }
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, thunkAPI) => {
    try {
      const res = await userAPI.updateProfile(userData);
      const state = thunkAPI.getState();
      const serverUser = res.data?.user || res.data;
      const updatedUser = {
        ...state.auth.user,
        ...serverUser,
        token: state.auth.user?.token,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

// Get Current User
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, thunkAPI) => {
    try {
      const res = await authAPI.getCurrentUser();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get user"
      );
    }
  }
);

// =======================
// Auth Slice
// =======================
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: user || null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isSuccess = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload, token: state.user?.token };
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
      });
  },
});

// Export actions and reducer
export const { reset } = authSlice.actions;
export default authSlice.reducer;










