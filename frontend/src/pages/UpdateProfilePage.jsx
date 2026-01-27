import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserIcon, SaveIcon, ArrowLeftIcon, MailIcon, LockIcon, UserCircleIcon } from "lucide-react";
import { updateProfile, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function UpdateProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "",
    });
  }, [user, navigate]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Profile updated successfully!");
      dispatch(reset());
      navigate("/profile");
    }
    
    if (isError) {
      toast.error(message || "Failed to update profile");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only send fields that have values
    const updateData = {
      username: formData.username,
      email: formData.email,
    };
    
    // Only include password if it's provided
    if (formData.password.trim()) {
      updateData.password = formData.password;
    }
    
    dispatch(updateProfile(updateData));
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pt-16 flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <motion.div
          className="w-full max-w-md px-4 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`rounded-2xl shadow-xl overflow-hidden ${darkMode ? "bg-gray-800/90" : "bg-white/95"} backdrop-blur-lg border ${darkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Header */}
            <div className={`p-6 text-center ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-800" : "bg-gradient-to-r from-indigo-50 to-indigo-100"}`}>
              <motion.div
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <UserCircleIcon className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className={`font-bold text-2xl ${darkMode ? "text-white" : "text-gray-800"}`}>
                Update Profile
              </h2>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Keep your information up to date
              </p>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Username
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" 
                          : "bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      } shadow-sm`}
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Email
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <MailIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" 
                          : "bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      } shadow-sm`}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <LockIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" 
                          : "bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      } shadow-sm`}
                    />
                  </div>
                  <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Minimum 6 characters
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg disabled:opacity-50"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium border transition-all ${
                      darkMode 
                        ? "border-gray-600 hover:bg-gray-700/50 text-gray-300" 
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    } shadow-sm hover:shadow`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}