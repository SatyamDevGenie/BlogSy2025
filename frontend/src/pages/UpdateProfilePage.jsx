import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, SaveIcon, ArrowLeftIcon, MailIcon, LockIcon, UserCircleIcon } from "lucide-react";
import { updateProfile, reset } from "../features/auth/authSlice";
import AnimatedBackground from "../components/AnimatedBackground";

export default function UpdateProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );

  const darkMode = useSelector((state) => state.theme.darkMode);
  const token = user?.token;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [localMessage, setLocalMessage] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      setLocalError("You must be logged in to update your profile.");
      return;
    }
    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "",
    });

    return () => {
      dispatch(reset());
    };
  }, [token, user, dispatch]);

  useEffect(() => {
    if (isSuccess) {
      setLocalMessage("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    }
    if (isError) setLocalError(message);
    setIsSubmitting(false);
  }, [isSuccess, isError, message, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalMessage(null);
    setLocalError(null);
    setIsSubmitting(true);
    dispatch(updateProfile(formData));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <AnimatedBackground />
      
      <motion.div
        className="relative z-10 w-full px-4 py-6 sm:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Mobile Back Button */}
        {isMobile && (
          <motion.button
            onClick={() => navigate(-1)}
            className={`mb-4 flex items-center gap-2 ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </motion.button>
        )}

        <motion.div
          className={`rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden mx-auto ${darkMode ? "bg-gray-800/90" : "bg-white/95"} backdrop-blur-lg max-w-md border ${darkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
          initial={{ y: 20, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {/* Header */}
          <div className={`p-6 sm:p-8 text-center relative overflow-hidden ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-800" : "bg-gradient-to-r from-indigo-50 to-indigo-100"}`}>
            {/* Decorative elements */}
            <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full ${darkMode ? "bg-indigo-900/20" : "bg-indigo-200/50"}`}></div>
            <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full ${darkMode ? "bg-purple-900/20" : "bg-purple-200/50"}`}></div>
            
            <motion.div
              className={`mx-auto rounded-full flex items-center justify-center ${isMobile ? "w-16 h-16 mb-4" : "w-20 h-20 mb-5"} relative z-10 shadow-md`}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <UserCircleIcon className={`${isMobile ? "w-8 h-8" : "w-10 h-10"} text-white`} />
            </motion.div>
            <motion.h2
              className={`font-bold ${isMobile ? "text-xl" : "text-2xl"} ${darkMode ? "text-white" : "text-gray-800"} relative z-10`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Update Your Profile
            </motion.h2>
            <motion.p
              className={`mt-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} relative z-10`}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Keep your information up to date
            </motion.p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence>
              {localMessage && (
                <motion.div
                  className="mb-5 p-3 rounded-lg bg-green-100 text-green-800 text-sm font-medium flex items-center justify-between shadow-sm"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {localMessage}
                  </div>
                  <button onClick={() => setLocalMessage(null)} className="text-green-600 hover:text-green-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </motion.div>
              )}

              {localError && (
                <motion.div
                  className="mb-5 p-3 rounded-lg bg-red-100 text-red-800 text-sm font-medium flex items-center justify-between shadow-sm"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    {localError}
                  </div>
                  <button onClick={() => setLocalError(null)} className="text-red-600 hover:text-red-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
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
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" : "bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"} shadow-sm`}
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
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" : "bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"} shadow-sm`}
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
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" : "bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"} shadow-sm`}
                  />
                </div>
                <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Minimum 6 characters
                </p>
              </div>

              {/* Buttons */}
              <div className={`pt-2 ${isMobile ? "space-y-3" : "flex gap-3"}`}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 ${isMobile ? "py-3 px-4 text-sm" : "py-3 px-6"} rounded-lg font-medium transition-all ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"} shadow-md hover:shadow-lg`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </motion.button>

                {!isMobile && (
                  <motion.button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium border transition-all ${darkMode ? "border-gray-600 hover:bg-gray-700/50 text-gray-300" : "border-gray-300 hover:bg-gray-50 text-gray-700"} shadow-sm hover:shadow`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Cancel
                  </motion.button>
                )}
              </div>
            </motion.form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { UserIcon, SaveIcon, ArrowLeftIcon, MailIcon, LockIcon, UserCircleIcon } from "lucide-react";
// import { updateProfile, reset } from "../features/auth/authSlice";
// import AnimatedBackground from "../components/AnimatedBackground";

// export default function UpdateProfilePage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { user, isSuccess, isError, message } = useSelector(
//     (state) => state.auth
//   );

//   const darkMode = useSelector((state) => state.theme.darkMode);
//   const token = user?.token;

//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });

//   const [localMessage, setLocalMessage] = useState(null);
//   const [localError, setLocalError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 640);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     if (!token) {
//       setLocalError("You must be logged in to update your profile.");
//       return;
//     }
//     setFormData({
//       username: user.username || "",
//       email: user.email || "",
//       password: "",
//     });

//     return () => {
//       dispatch(reset());
//     };
//   }, [token, user, dispatch]);

//   useEffect(() => {
//     if (isSuccess) {
//       setLocalMessage("Profile updated successfully!");
//       setTimeout(() => {
//         navigate("/profile");
//       }, 1500);
//     }
//     if (isError) setLocalError(message);
//     setIsSubmitting(false);
//   }, [isSuccess, isError, message, navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLocalMessage(null);
//     setLocalError(null);
//     setIsSubmitting(true);
//     dispatch(updateProfile(formData));
//   };

//   return (
//     <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
//       <AnimatedBackground />
      
//       <motion.div
//         className="relative z-10 w-full px-4 py-6 sm:py-8"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         {/* Mobile Back Button */}
//         {isMobile && (
//           <motion.button
//             onClick={() => navigate(-1)}
//             className={`mb-4 flex items-center gap-2 ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}
//             initial={{ x: -20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             <ArrowLeftIcon className="w-5 h-5" />
//             <span>Back</span>
//           </motion.button>
//         )}

//         <motion.div
//           className={`rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl overflow-hidden mx-auto ${darkMode ? "bg-gray-800/90" : "bg-white/90"} backdrop-blur-lg max-w-md`}
//           initial={{ y: 20, scale: 0.98 }}
//           animate={{ y: 0, scale: 1 }}
//           transition={{ type: "spring", stiffness: 100 }}
//         >
//           {/* Header */}
//           <div className={`p-5 sm:p-6 text-center ${darkMode ? "bg-gray-700" : "bg-indigo-50"}`}>
//             <motion.div
//               className={`mx-auto rounded-full flex items-center justify-center ${isMobile ? "w-16 h-16 mb-3" : "w-20 h-20 mb-4"}`}
//               style={{
//                 background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
//               }}
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2 }}
//             >
//               <UserCircleIcon className={isMobile ? "w-8 h-8" : "w-10 h-10"} />
//             </motion.div>
//             <motion.h2
//               className={`font-bold ${isMobile ? "text-xl" : "text-2xl"} ${darkMode ? "text-white" : "text-gray-800"}`}
//               initial={{ y: -10, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               Update Your Profile
//             </motion.h2>
//           </div>

//           {/* Form Content */}
//           <div className="p-5 sm:p-6">
//             <AnimatePresence>
//               {localMessage && (
//                 <motion.div
//                   className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm font-medium flex items-center justify-center"
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                 >
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                   </svg>
//                   {localMessage}
//                 </motion.div>
//               )}

//               {localError && (
//                 <motion.div
//                   className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium flex items-center justify-center"
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                 >
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
//                   </svg>
//                   {localError}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <motion.form
//               onSubmit={handleSubmit}
//               className="space-y-4"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//             >
//               {/* Username Field */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Username
//                 </label>
//                 <div className="relative">
//                   <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                     <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
//                   </div>
//                   <input
//                     type="text"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     className={`w-full ${isMobile ? "pl-9 pr-3 py-2 text-sm" : "pl-10 pr-4 py-3"} rounded-lg border focus:ring-2 focus:outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 text-white placeholder-gray-400" : "bg-white border-gray-300 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"}`}
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Email Field */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Email
//                 </label>
//                 <div className="relative">
//                   <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                     <MailIcon className="w-4 h-4 sm:w-5 sm:h-5" />
//                   </div>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`w-full ${isMobile ? "pl-9 pr-3 py-2 text-sm" : "pl-10 pr-4 py-3"} rounded-lg border focus:ring-2 focus:outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 text-white placeholder-gray-400" : "bg-white border-gray-300 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"}`}
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   New Password (optional)
//                 </label>
//                 <div className="relative">
//                   <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                     <LockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
//                   </div>
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Leave blank to keep current"
//                     className={`w-full ${isMobile ? "pl-9 pr-3 py-2 text-sm" : "pl-10 pr-4 py-3"} rounded-lg border focus:ring-2 focus:outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-indigo-500 text-white placeholder-gray-400" : "bg-white border-gray-300 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"}`}
//                   />
//                 </div>
//               </div>

//               {/* Buttons */}
//               <div className={`pt-4 ${isMobile ? "space-y-3" : "flex gap-3"}`}>
//                 <motion.button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className={`w-full flex items-center justify-center gap-2 ${isMobile ? "py-2 px-4 text-sm" : "py-3 px-6"} rounded-lg font-medium transition ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"} shadow-md`}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <SaveIcon className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
//                       Save Changes
//                     </>
//                   )}
//                 </motion.button>

//                 {!isMobile && (
//                   <motion.button
//                     type="button"
//                     onClick={() => navigate("/profile")}
//                     className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium border transition ${darkMode ? "border-gray-600 hover:bg-gray-700 text-gray-300" : "border-gray-300 hover:bg-gray-50 text-gray-700"}`}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <ArrowLeftIcon className="w-5 h-5" />
//                     Cancel
//                   </motion.button>
//                 )}
//               </div>
//             </motion.form>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }



