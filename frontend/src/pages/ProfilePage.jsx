import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { getUserProfile, removeFromFavorites } from "../features/user/userSlice";
import { fetchBlogs } from "../features/blog/blogSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  MailIcon,
  HeartIcon,
  FileTextIcon,
  UsersIcon,
  UserPlusIcon,
  PencilIcon,
  HomeIcon,
  XIcon,
  MenuIcon,
  BookmarkIcon,
  ClockIcon,
  ChevronRightIcon,
  StarIcon,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, isLoading, isError, message } = useSelector((state) => state.user);
  const { blogs } = useSelector((state) => state.blog);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("blogs");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(getUserProfile());
    dispatch(fetchBlogs());
  }, [dispatch, user, navigate]);

  const handleRemoveFromFavourites = async (blogId) => {
    try {
      await dispatch(removeFromFavorites(blogId)).unwrap();
      toast.success("Removed from favorites");
      dispatch(getUserProfile()); // Refresh profile
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  const handleEditProfile = () => navigate("/updateProfile");
  const handleBlogClick = (id) => navigate(`/blogs/${id}`);

  // Backend getProfile returns { user, blogs } – use profile.blogs for my blogs, or fallback to filtering
  const profileUser = profile?.user || profile;
  const userBlogs = profile?.blogs?.length ? profile.blogs : blogs.filter((blog) => blog.author?._id === user?._id);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className={`min-h-screen flex flex-col pt-16 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Loading your profile...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Navbar />
        <div className={`min-h-screen flex flex-col pt-16 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-red-500 text-5xl">⚠️</div>
              <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Oops! Something went wrong
              </h3>
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>{message}</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className={`min-h-screen flex flex-col pt-16 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>No profile data available</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div
        className={`min-h-screen pt-16 ${darkMode ? "bg-gray-900" : "bg-gray-50"} px-4 sm:px-8 py-10 transition-colors duration-300`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
      {/* Floating Menu Button */}
      <motion.button
        onClick={() => setShowSidebar(true)}
        className="fixed top-6 left-6 bg-white/80 dark:bg-gray-700/80 backdrop-blur-lg border border-gray-200 dark:border-gray-600 rounded-full p-3 shadow-lg hover:bg-indigo-100 dark:hover:bg-gray-600 transition-all duration-300 z-50"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <MenuIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
      </motion.button>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
            />
            <motion.div
              className="fixed top-0 left-0 h-full w-80 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-indigo-200/50 dark:border-gray-700/50 shadow-2xl z-50 rounded-r-3xl flex flex-col p-6"
              initial={{ x: -350 }}
              animate={{ x: 0 }}
              exit={{ x: -350 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => setShowSidebar(false)}
                className="absolute top-4 right-4 bg-white dark:bg-gray-700 shadow rounded-full p-2 hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XIcon className="w-5 h-5 text-red-500" />
              </motion.button>

              <div className="flex flex-col items-center mt-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {(profileUser?.username || "U").charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white mt-4">
                  {profileUser?.username || user?.username}
                </h1>
                <p className="text-gray-500 dark:text-gray-300 text-sm flex items-center gap-1 mt-1">
                  <MailIcon className="w-4 h-4" /> {profileUser?.email || user?.email}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                <motion.button
                  onClick={handleEditProfile}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Profile
                </motion.button>

                <motion.button
                  onClick={() => navigate("/")}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md flex items-center justify-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HomeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Home
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-10">
        {/* Profile Header */}
        <motion.div
          className={`${darkMode ? "bg-gray-800/80" : "bg-white/80"} backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 border ${darkMode ? "border-gray-700/50" : "border-gray-100/50"}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
              {(profileUser?.username || user?.username || "U").charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className={`text-2xl sm:text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-800"}`}>
              {profileUser?.username || user?.username || "User"}
            </h1>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} mt-1 flex items-center justify-center sm:justify-start gap-2`}>
              <MailIcon className="w-4 h-4" /> {profileUser?.email || user?.email || "No email"}
            </p>
            <div className="flex gap-4 mt-4 justify-center sm:justify-start">
              <span className={`text-sm ${darkMode ? "bg-indigo-900/80 text-indigo-200" : "bg-indigo-100/80 text-indigo-700"} px-3 py-1 rounded-full flex items-center gap-1`}>
                <UsersIcon className="w-3 h-3" /> {profileUser?.followers?.length || 0} Followers
              </span>
              <span className={`text-sm ${darkMode ? "bg-pink-900/80 text-pink-200" : "bg-pink-100/80 text-pink-700"} px-3 py-1 rounded-full flex items-center gap-1`}>
                <UserPlusIcon className="w-3 h-3" /> {profileUser?.following?.length || 0} Following
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className={`flex border-b ${darkMode ? "border-gray-700" : "border-gray-200"} mb-8 overflow-x-auto`}>
          {[
            { id: "blogs", label: "My Blogs", icon: FileTextIcon, count: userBlogs.length },
            { id: "favorites", label: "Favorites", icon: HeartIcon, count: profileUser?.favourites?.length || 0 },
            { id: "drafts", label: "Drafts", icon: BookmarkIcon, count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 font-medium text-sm transition-colors relative ${activeTab === tab.id
                ? `${darkMode ? "text-indigo-400" : "text-indigo-600"}`
                : `${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs ${darkMode ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-600"} px-2 py-0.5 rounded-full`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "blogs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBlogs.length > 0 ? (
                  userBlogs.map((blog) => (
                    <motion.div
                      key={blog._id}
                      className={`${darkMode ? "bg-gray-800/80" : "bg-white/80"} backdrop-blur-sm rounded-xl border ${darkMode ? "border-gray-700/50" : "border-gray-100/50"} shadow hover:shadow-xl transition-all overflow-hidden cursor-pointer group`}
                      whileHover={{ y: -5 }}
                      onClick={() => handleBlogClick(blog._id)}
                    >
                      {blog.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"} truncate`}>
                            {blog.title}
                          </h3>
                          <ChevronRightIcon className={`w-5 h-5 ${darkMode ? "text-gray-400 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-500"} transition-colors`} />
                        </div>
                        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm line-clamp-2 mt-2`}>
                          {blog.content}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className={`flex items-center gap-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            <ClockIcon className="w-3 h-3" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <StarIcon className="w-3 h-3 fill-yellow-400" />
                            {blog.likes?.length || 0}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <FileTextIcon className={`w-12 h-12 ${darkMode ? "text-gray-500" : "text-gray-400"} mx-auto`} />
                    <p className={`mt-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      You haven't written any blogs yet.
                    </p>
                    <button
                      onClick={() => navigate("/createBlog")}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
                    >
                      Write Your First Blog
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileUser?.favourites?.length > 0 ? (
                  profileUser.favourites.map((fav) => (
                    <motion.div
                      key={fav._id}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-100/50 dark:border-gray-700/50 shadow hover:shadow-xl transition-all overflow-hidden group"
                      whileHover={{ y: -5 }}
                    >
                      {fav.image && (
                        <div
                          className="relative h-48 overflow-hidden cursor-pointer"
                          onClick={() => handleBlogClick(fav._id)}
                        >
                          <img
                            src={fav.image}
                            alt={fav.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <h3
                              className="text-lg font-semibold text-gray-800 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              onClick={() => handleBlogClick(fav._id)}
                            >
                              {fav.title}
                            </h3>
                            <p className="text-pink-600 dark:text-pink-400 text-sm mt-1">
                              by {fav.author?.username}
                            </p>
                          </div>
                          <button
                            className="text-xs bg-red-500/90 hover:bg-red-600 text-white px-3 py-1 rounded-full transition-colors shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromFavourites(fav._id);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-3 h-3" />
                            {new Date(fav.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <StarIcon className="w-3 h-3 fill-yellow-400" />
                            {fav.likes?.length || 0}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <HeartIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">
                      You haven't favorited any blogs yet.
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
                    >
                      Explore Blogs
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "drafts" && (
              <div className="text-center py-12">
                <BookmarkIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Your drafts will appear here.
                </p>
                <button
                  onClick={() => navigate("/createBlog")}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
                >
                  Create New Draft
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </motion.div>
      <Footer />
    </>
  );
}

