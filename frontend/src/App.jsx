import { useEffect } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import About from "./pages/About";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import SingleBlogPage from "./pages/SingleBlogPage";
import CreateBlogPage from "./pages/CreateBlogPage";
import EditBlogPage from "./pages/EditBlogPage";
import TrendingPage from "./pages/TrendingPage";
import LatestBlogPage from "./pages/LatestBlogPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Animation Wrapper Component
function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// ✅ Routes with Animation Handler
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<AnimatedPage><LoginPage /></AnimatedPage>}
        />
        <Route
          path="/register"
          element={<AnimatedPage><RegisterPage /></AnimatedPage>}
        />
        <Route
          path="/about"
          element={<AnimatedPage><About /></AnimatedPage>}
        />
        <Route
          path="/blogs/:id"
          element={<AnimatedPage><SingleBlogPage /></AnimatedPage>}
        />
        <Route path="/forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
        <Route path="/reset-password/:token" element={<AnimatedPage><ResetPasswordPage /></AnimatedPage>} />
        <Route path="/verify-email/:token" element={<AnimatedPage><VerifyEmailPage /></AnimatedPage>} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AnimatedPage><HomePage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trending"
          element={
            <ProtectedRoute>
              <AnimatedPage><TrendingPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/latest"
          element={
            <ProtectedRoute>
              <AnimatedPage><LatestBlogPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/createBlog"
          element={
            <ProtectedRoute>
              <AnimatedPage><CreateBlogPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AnimatedPage><DashboardPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-blog/:id"
          element={
            <ProtectedRoute>
              <AnimatedPage><EditBlogPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AnimatedPage><ProfilePage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/updateProfile"
          element={
            <ProtectedRoute>
              <AnimatedPage><UpdateProfilePage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// ✅ Main App Component
export default function App() {
  const darkMode = useSelector((state) => state.theme.darkMode);

  // Add or remove dark class on html tag
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>

      {/* Toast */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </>
  );
}




