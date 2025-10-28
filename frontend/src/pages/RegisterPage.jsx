import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || "Registration failed. Please try again.");
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.success(`${user.username || user.email} registered successfully 🎉`);
      navigate("/");
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-[#dbeafe] via-[#ede9fe] to-[#fef3c7] dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md sm:max-w-lg bg-white/80 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/30 dark:border-gray-700 shadow-2xl rounded-2xl p-8 sm:p-10"
      >
        {/* Heading */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-semibold tracking-tight"
          >
            Create your Account
          </motion.h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Join us and start your journey today
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
          {/* Username */}
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your unique username"
              className="w-full px-5 py-3 bg-white/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
              minLength={3}
            />
          </motion.div>

          {/* Email */}
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-5 py-3 bg-white/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
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
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="w-full px-5 py-3 bg-white/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12 transition-all"
                required
                minLength={8}
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum 8 characters
            </p>
          </motion.div>

          {/* Register Button */}
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
                Creating account...
              </>
            ) : (
              "Register"
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
          Already have an account ?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign in here
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
