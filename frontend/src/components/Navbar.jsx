import { Link } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaMoon, FaSun, FaSearch, FaPenAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { toggleTheme } from "../features/mode/themeSlice";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm' : 'py-3 bg-white dark:bg-gray-900'} border-b border-gray-200/50 dark:border-gray-700/30`}>
      <div className="max-w-7xl mx-auto px-5 xl:px-0">
        <div className="flex items-center justify-between">
          {/* Logo with subtle animation */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.span 
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              BlogSy
            </motion.span>
            <motion.span 
              className="text-xs hidden sm:inline-block px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-medium"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              v2.0
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-4 ml-4">
              {/* Theme Toggle with smooth transition */}
              <motion.button
                onClick={() => dispatch(toggleTheme())}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                aria-label="Toggle theme"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
              </motion.button>

              {user ? (
                <>
                  {/* Create Blog Button with floating effect */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      to="/createBlog"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <FaPenAlt className="w-3 h-3" />
                      <span>Create Blog</span>
                    </Link>
                  </motion.div>

                  {/* User Dropdown with smooth animation */}
                  <div className="relative group">
                    <motion.button 
                      className="flex items-center space-x-1 focus:outline-none"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    </motion.button>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Your Profile
                      </Link>
                      <motion.button
                        onClick={() => dispatch(logout())}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaSignOutAlt className="w-3 h-3" />
                        <span>Sign out</span>
                      </motion.button>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Get started
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button with animation */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full focus:outline-none"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? (
              <FaTimes className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-transform`} />
            ) : (
              <FaBars className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-transform`} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu with smooth animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden overflow-hidden ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-lg shadow-lg`}
          >
            <div className="px-5 py-3">
              <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                  <motion.button
                    onClick={() => dispatch(toggleTheme())}
                    className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
                  </motion.button>
                </div>

                {user ? (
                  <>
                    <motion.div 
                      whileTap={{ scale: 0.98 }}
                      className="mb-3"
                    >
                      <Link
                        to="/createBlog"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium shadow-md"
                      >
                        <FaPenAlt className="w-3 h-3" />
                        <span>Create Blog</span>
                      </Link>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 py-3 text-gray-700 dark:text-gray-300 font-medium"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-md">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span>Your Profile</span>
                      </Link>
                    </motion.div>

                    <motion.button
                      onClick={() => {
                        dispatch(logout());
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 py-2.5 text-red-500 font-medium mt-2"
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaSignOutAlt />
                      <span>Sign out</span>
                    </motion.button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center py-2.5 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                      >
                        Sign in
                      </Link>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md"
                      >
                        Get started
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


// import { Link } from "react-router-dom";
// import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaMoon, FaSun, FaSearch, FaPenAlt } from "react-icons/fa";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../features/auth/authSlice";
// import { toggleTheme } from "../features/mode/themeSlice";
// import { useState, useEffect } from "react";

// export default function Navbar() {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const darkMode = useSelector((state) => state.theme.darkMode);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 10) {
//         setScrolled(true);
//       } else {
//         setScrolled(false);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'py-3 bg-white dark:bg-gray-900'} border-b border-gray-200/50 dark:border-gray-700/30`}>
//       <div className="max-w-7xl mx-auto px-5 xl:px-0">
//         <div className="flex items-center justify-between">
//           {/* Logo */}
//           <Link to="/" className="flex items-center space-x-2 group">
//             <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">BlogSy</span>
//             <span className="text-xs hidden sm:inline-block px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-medium group-hover:scale-105 transition-transform">
//               v2.0
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">

//             <div className="flex items-center space-x-4 ml-4">
//               <button
//                 onClick={() => dispatch(toggleTheme())}
//                 className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
//                 aria-label="Toggle theme"
//               >
//                 {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
//               </button>

//               {user ? (
//                 <>
//                   <Link
//                     to="/createBlog"
//                     className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
//                   >
//                     <FaPenAlt className="w-3 h-3" />
//                     <span>Create Your blog</span>
//                   </Link>

//                   <div className="relative group">
//                     <button className="flex items-center space-x-1 focus:outline-none">
//                       <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
//                         {user.username.charAt(0).toUpperCase()}
//                       </div>
//                     </button>
                    
//                     <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700">
//                       <Link
//                         to="/profile"
//                         className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                       >
//                         Your Profile
//                       </Link>
//                       {/* <Link
//                         to="/settings"
//                         className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                       >
//                         Settings
//                       </Link> */}
//                       <button
//                         onClick={() => dispatch(logout())}
//                         className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
//                       >
//                         <FaSignOutAlt className="w-3 h-3" />
//                         <span>Sign out</span>
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex items-center space-x-3">
//                   <Link
//                     to="/login"
//                     className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
//                   >
//                     Sign in
//                   </Link>
//                   <Link
//                     to="/register"
//                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors"
//                   >
//                     Get started
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="md:hidden p-2 rounded-full focus:outline-none"
//             aria-label="Toggle menu"
//           >
//             {isMenuOpen ? (
//               <FaTimes className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
//             ) : (
//               <FaBars className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {isMenuOpen && (
//         <div className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
//           <div className="px-5 py-3">

//             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//               <div className="flex items-center justify-between mb-4">
//                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
//                 <button
//                   onClick={() => dispatch(toggleTheme())}
//                   className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
//                 >
//                   {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
//                 </button>
//               </div>

//               {user ? (
//                 <>
//                   <Link
//                     to="/createBlog"
//                     onClick={() => setIsMenuOpen(false)}
//                     className="w-full flex items-center justify-center space-x-2 mb-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium"
//                   >
//                     <FaPenAlt className="w-3 h-3" />
//                     <span>Create your blog</span>
//                   </Link>

//                   <Link
//                     to="/profile"
//                     onClick={() => setIsMenuOpen(false)}
//                     className="flex items-center space-x-2 py-3 text-gray-700 dark:text-gray-300 font-medium"
//                   >
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
//                       {user.username.charAt(0).toUpperCase()}
//                     </div>
//                     <span>Your Profile</span>
//                   </Link>

//                   <button
//                     onClick={() => {
//                       dispatch(logout());
//                       setIsMenuOpen(false);
//                     }}
//                     className="w-full flex items-center space-x-2 py-2 text-red-500 font-medium mt-2"
//                   >
//                     <FaSignOutAlt />
//                     <span>Sign out</span>
//                   </button>
//                 </>
//               ) : (
//                 <div className="space-y-3">
//                   <Link
//                     to="/login"
//                     onClick={() => setIsMenuOpen(false)}
//                     className="block w-full text-center py-2.5 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
//                   >
//                     Sign in
//                   </Link>
//                   <Link
//                     to="/register"
//                     onClick={() => setIsMenuOpen(false)}
//                     className="block w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium"
//                   >
//                     Get started
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

