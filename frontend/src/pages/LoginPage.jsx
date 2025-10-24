import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isError, isSuccess, message, isLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user) {
      toast.success(`Welcome back, ${user.username || user.email}! 🎉`);
      navigate("/");
      dispatch(reset());
    }
    if (isError) {
      toast.error(message || "Login failed. Please check your credentials.");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, navigate, dispatch]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500 py-8 sm:py-12">
      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-xl shadow-xl dark:shadow-2xl border border-white/40 dark:border-gray-700 transition-all duration-500"
      >
        {/* Heading */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
          >
            Login ✨
          </motion.h1>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 md:space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Email */}
          <motion.div 
            whileHover={{ scale: 1.01 }} 
            className="space-y-1 sm:space-y-2"
          >
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 sm:px-5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              autoComplete="email"
            />
          </motion.div>

          {/* Password */}
          <motion.div 
            whileHover={{ scale: 1.01 }} 
            className="space-y-1 sm:space-y-2"
          >
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 sm:px-5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} className="stroke-[1.5]" />
                ) : (
                  <Eye size={18} className="stroke-[1.5]" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Forgot Password Link */}
          {/* <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div> */}

          {/* Login Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-fit flex justify-center items-center py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium text-sm sm:text-base shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></span>
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300"
        >
          Don't have an account ?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Register here
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}


