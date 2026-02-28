import { useState, useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { scaleIn } from "../utils/animations";

const HeroScene = lazy(() => import("../components/HeroScene"));

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
  }, [isSuccess, isError, message, user, navigate, dispatch]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 md:py-20 overflow-hidden">
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
      <motion.div
        {...scaleIn}
        className="relative w-full max-w-md sm:max-w-lg glass-card p-6 sm:p-8 md:p-10 mx-4 sm:mx-0"
      >
        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-semibold tracking-tight"
          >
            Login 
          </motion.h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Please login to continue to your account
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12, delayChildren: 0.1 },
            },
          }}
        >
          {/* Email */}
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-5 py-3 bg-white/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
              autoComplete="email"
            />
          </motion.div>

          {/* Password */}
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-3 bg-white/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12 transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={20} className="stroke-[1.5]" />
                ) : (
                  <Eye size={20} className="stroke-[1.5]" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 bg-black hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-200"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300"
        >
          Don’t have an account ?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Register here
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}



