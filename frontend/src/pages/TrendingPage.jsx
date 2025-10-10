import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import BlogCard from "../components/BlogCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";
import { SparklesIcon, FireIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function TrendingPage() {
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const fetchTrendingBlogs = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        "http://localhost:5000/api/blogs/trending"
      );
      setTrendingBlogs(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch trending blogs. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingBlogs();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Navbar />

      {/* Header Section */}
      <section className="relative overflow-hidden text-center py-16 px-4 sm:px-6 lg:px-8 mt-10">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white mb-6 shadow-lg">
            <FireIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">Trending Now</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-400">
            Hot Topics This Week
          </h1>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Discover what the community is buzzing about right now
          </p>
        </motion.div>
      </section>

      {/* Content Section */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Refresh Button */}
          <div className="flex justify-end mb-8">
            <motion.button
              onClick={fetchTrendingBlogs}
              disabled={refreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"} shadow-md transition-all`}
            >
              <ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </motion.button>
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center mb-4">
                  <FireIcon className="w-8 h-8 text-white" />
                </div>
                <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Loading trending content...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">{error}</h3>
              <button
                onClick={fetchTrendingBlogs}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          ) : trendingBlogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium mb-2">No trending blogs found</h3>
              <p className={`max-w-md mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Check back later or explore other sections of the site
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {trendingBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  variants={itemVariants}
                  custom={index}
                  className="flex"
                >
                  <BlogCard 
                    blog={blog} 
                    featured={index < 3} // Mark first 3 blogs as featured
                    rank={index + 1} // Pass rank for badge display
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}



// import { useEffect, useState } from "react";
// import axios from "axios";
// import BlogCard from "../components/BlogCard";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import { useSelector } from "react-redux";
// import AnimatedBackground from "../components/AnimatedBackground";

// export default function TrendingPage() {
//   const [trendingBlogs, setTrendingBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const darkMode = useSelector((state) => state.theme.darkMode); // ✅ access theme from Redux

//   useEffect(() => {
//     const fetchTrendingBlogs = async () => {
//       try {
//         const response = await axios.get(
//           "https://blogsy-deployment.onrender.com/api/blogs/trending"
//         );
//         setTrendingBlogs(response.data);
//       } catch (err) {
//         setError("Failed to fetch trending blogs.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrendingBlogs();
//   }, []);

//   return (
//     <div className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}>
//       <Navbar />

//       {/* Header */}
//       <section className="text-center py-12 px-4 sm:py-16 sm:px-6 lg:px-8 mt-12">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 tracking-tight animate-fade-in mt-6">
//           🔥 Trending Blogs
//         </h1>
//         <p
//           className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in delay-150 ${
//             darkMode ? "text-gray-300" : "text-gray-600"
//           }`}
//         >
//           Explore the most viewed blogs curated by our community.
//         </p>
//       </section>

//       <AnimatedBackground/>

//       {/* Blog Grid */}
//       <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-[60vh]">
//         {loading ? (
//           <p className="text-center animate-pulse text-gray-400">
//             Loading trending blogs...
//           </p>
//         ) : error ? (
//           <p className="text-center text-red-500">{error}</p>
//         ) : trendingBlogs.length === 0 ? (
//           <p className="text-center text-gray-400">No trending blogs found.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
//             {trendingBlogs.map((blog, index) => (
//               <div
//                 key={blog._id}
//                 className="transition duration-300 transform hover:scale-105"
//                 style={{
//                   animation: `fadeInUp 0.5s ease ${index * 100}ms both`,
//                 }}
//               >
//                 <div className="scale-95 sm:scale-100">
//                   <BlogCard blog={blog} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// }



