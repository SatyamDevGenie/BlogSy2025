// src/features/theme/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Read from localStorage on first load
const storedDarkMode = localStorage.getItem('darkMode') === 'true';

const initialState = {
  darkMode: storedDarkMode || false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode); // Save change
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload); // Save change
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;



