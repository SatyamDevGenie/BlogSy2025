import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaCalendar,
  FaChartLine,
  FaUsers,
  FaBookmark,
  FaChartBar
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchBlogs, deleteBlog } from "../features/blog/blogSlice";
import { getUserProfile } from "../features/user/userSlice";
import { toast } from "react-toastify";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { blogs, isLoading } = useSelector((state) => state.blog);
  const { profile } = useSelector((state) => state.user);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchBlogs());
    dispatch(getUserProfile());
  }, [dispatch, user]);

  // Filter user's blogs
  const userBlogs = blogs.filter(blog => blog.author?._id === user?._id);
  
  // Calculate stats
  const totalBlogs = userBlogs.length;
  const totalViews = userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const totalLikes = userBlogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
  const totalComments = userBlogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0);

  const handleDeleteBlog = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (blogToDelete) {
      try {
        await dispatch(deleteBlog(blogToDelete._id)).unwrap();
        toast.success("Blog deleted successfully!");
        setShowDeleteModal(false);
        setBlogToDelete(null);
      } catch (error) {
        toast.error("Failed to delete blog");
      }
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartLine },
    { id: "blogs", label: "My Blogs", icon: FaEdit },
    { id: "analytics", label: "Analytics", icon: FaChartBar },
    { id: "favorites", label: "Favorites", icon: FaBookmark }
  ];

  const stats = [
    { label: "Total Blogs", value: totalBlogs, icon: FaEdit, color: "blue" },
    { label: "Total Views", value: totalViews, icon: FaEye, color: "green" },
    { label: "Total Likes", value: totalLikes, icon: FaHeart, color: "red" },
    { label: "Total Comments", value: totalComments, icon: FaComment, color: "purple" }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Welcome back, {user?.username}! Here's your blog overview.
              </p>
            </div>
            <Link
              to="/createBlog"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaPlus className="text-sm" />
              Create New Blog
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`p-6 rounded-xl ${
                darkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg border ${
                darkMode ? "border-gray-700/50" : "border-gray-200"
              } hover:shadow-xl transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`text-xl text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : `border-transparent ${
                          darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                        }`
                  }`}
                >
                  <tab.icon className="text-sm" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Recent Blogs */}
              <div className={`p-6 rounded-xl ${
                darkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg border ${
                darkMode ? "border-gray-700/50" : "border-gray-200"
              }`}>
                <h3 className="text-lg font-semibold mb-4">Recent Blogs</h3>
                {userBlogs.length === 0 ? (
                  <p className={`py-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No blogs yet. <Link to="/createBlog" className="text-indigo-600 hover:underline">Create one</Link>
                  </p>
                ) : (
                  userBlogs.slice(0, 5).map((blog) => (
                    <div
                      key={blog._id}
                      className={`flex items-center justify-between py-3 border-b last:border-b-0 ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{blog.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaEye /> {blog.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaHeart /> {blog.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaComment /> {blog.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/edit-blog/${blog._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeleteBlog(blog)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-6 rounded-xl ${darkMode ? "bg-gray-800/50" : "bg-white"} shadow-lg border ${darkMode ? "border-gray-700/50" : "border-gray-200"}`}
            >
              <h3 className="text-lg font-semibold mb-4">Analytics</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                Detailed analytics coming soon. Your stats are summarized in the overview above.
              </p>
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {profile?.user?.favourites?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.user.favourites.map((fav) => (
                    <Link
                      key={fav._id}
                      to={`/blogs/${fav._id}`}
                      className={`p-6 rounded-xl ${darkMode ? "bg-gray-800/50" : "bg-white"} shadow-lg border ${darkMode ? "border-gray-700/50" : "border-gray-200"} hover:shadow-xl transition-all`}
                    >
                      {fav.image && (
                        <img src={fav.image} alt={fav.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                      )}
                      <h4 className="font-semibold line-clamp-2">{fav.title}</h4>
                      <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        by {fav.author?.username}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={`p-8 rounded-xl text-center ${darkMode ? "bg-gray-800/50" : "bg-white"} border ${darkMode ? "border-gray-700/50" : "border-gray-200"}`}>
                  <FaBookmark className={`w-12 h-12 mx-auto mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>No favorite blogs yet.</p>
                  <Link to="/" className="inline-block mt-3 text-indigo-600 hover:underline">Explore blogs</Link>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "blogs" && (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userBlogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-xl ${
                    darkMode ? "bg-gray-800/50" : "bg-white"
                  } shadow-lg border ${
                    darkMode ? "border-gray-700/50" : "border-gray-200"
                  } hover:shadow-xl transition-all duration-200`}
                >
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-semibold mb-2 line-clamp-2">{blog.title}</h3>
                  <p className={`text-sm mb-4 line-clamp-3 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {blog.content.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FaCalendar />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FaEye /> {blog.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaHeart /> {blog.likes?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/blogs/${blog._id}`}
                      className="flex-1 text-center py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit-blog/${blog._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDeleteBlog(blog)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Delete Blog</h3>
              <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Are you sure you want to delete "{blogToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}