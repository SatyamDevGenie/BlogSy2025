import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../features/blog/blogSlice";
import BlogCard from "../components/BlogCard";
import Navbar from "../components/Navbar";
import About from "./About";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaFilter, FaSortAmountDown } from "react-icons/fa";
import AnimatedBackground from "../components/AnimatedBackground";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs, isLoading, isError, message } = useSelector((state) => state.blog);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [searchTitle, setSearchTitle] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [category, setCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitle(searchTitle);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTitle]);

  const filteredBlogs = blogs
    .filter((blog) => {
      const matchesTitle = blog.title.toLowerCase().includes(debouncedTitle.toLowerCase());
      const matchesCategory = category === "All" || blog.category === category;
      return matchesTitle && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === "Trending") return (b.likes?.length || 0) - (a.likes?.length || 0);
      return 0;
    });

  const categories = ["All", "Technology", "Lifestyle", "Travel", "Education"];
  const sortOptions = ["Newest", "Oldest", "Trending"];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <motion.section
        className="relative text-center py-16 px-4 md:py-20 lg:py-24 transition-colors duration-300 mt-16 md:mt-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <About />
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Filter Bar */}
        <motion.div
          className={`sticky top-0 z-20 ${darkMode ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-lg border-b ${darkMode ? "border-gray-700/50" : "border-gray-200/80"
            } py-3 transition-all duration-300`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-auto md:flex-1">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                <FaSearch className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className={`block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm md:text-base ${darkMode
                    ? "bg-gray-800/70 border-gray-700/50 text-white placeholder-gray-400 focus:ring-indigo-500/50"
                    : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500/30"
                  } border focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-2.5 rounded-lg border text-sm md:text-base ${darkMode
                      ? "bg-gray-800/70 border-gray-700/50 text-white"
                      : "bg-white/80 border-gray-200 text-gray-900"
                    } focus:outline-none focus:ring-2 ${darkMode ? "focus:ring-indigo-500/50" : "focus:ring-indigo-500/30"
                    } cursor-pointer transition-all duration-200`}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <FaFilter className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"
                  } text-xs`} />
              </div>

              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-2.5 rounded-lg border text-sm md:text-base ${darkMode
                      ? "bg-gray-800/70 border-gray-700/50 text-white"
                      : "bg-white/80 border-gray-200 text-gray-900"
                    } focus:outline-none focus:ring-2 ${darkMode ? "focus:ring-indigo-500/50" : "focus:ring-indigo-500/30"
                    } cursor-pointer transition-all duration-200`}
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <FaSortAmountDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"
                  } text-xs`} />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`md:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border ${darkMode
                  ? "bg-gray-800/70 border-gray-700/50 text-gray-300"
                  : "bg-white/80 border-gray-200 text-gray-700"
                } transition-all duration-200`}
            >
              <FaFilter className="text-sm" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>

          {/* Mobile Filters Panel */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`mt-3 overflow-hidden ${darkMode ? "bg-gray-800/50" : "bg-white/80"} rounded-lg`}
              >
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`block w-full px-3 py-2 rounded-lg border text-sm ${darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                      Sort By
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className={`block w-full px-3 py-2 rounded-lg border text-sm ${darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
                    >
                      {sortOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Blog Cards Section */}
        <main className="py-6 md:py-8 lg:py-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`h-72 rounded-xl overflow-hidden ${darkMode ? "bg-gray-800/50" : "bg-white/80"
                    } shadow-sm animate-pulse`}
                />
              ))}
            </div>
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded-xl text-center ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-700"
                } shadow-sm`}
            >
              <p className="font-medium text-sm md:text-base">{message}</p>
            </motion.div>
          ) : filteredBlogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex flex-col items-center justify-center py-16 rounded-xl ${darkMode ? "bg-gray-800/50" : "bg-white/80"
                } shadow-sm`}
            >
              <div className={`w-16 h-16 rounded-full ${darkMode ? "bg-gray-700/50" : "bg-gray-200"
                } flex items-center justify-center mb-4`}>
                <FaSearch className={`text-xl ${darkMode ? "text-gray-500" : "text-gray-400"
                  }`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                No blogs found
              </h3>
              <p className={`text-sm max-w-md text-center ${darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {filteredBlogs.map((blog) => (
                  <motion.div
                    key={blog._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="transition-transform duration-200"
                  >
                    <BlogCard blog={blog} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <Footer />

    </div>
  );
}

