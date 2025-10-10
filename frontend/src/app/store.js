import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import blogReducer from "../features/blog/blogSlice";
import themeReducer from "../features/mode/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blog: blogReducer,
    theme: themeReducer,

  },
});
