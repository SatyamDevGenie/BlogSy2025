import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function BlogCard({ blog, featured = false }) {
  const darkMode = useSelector((state) => state.theme.darkMode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/blogs/${blog._id}`}
        className={`group relative rounded-2xl border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200"
        } ${featured ? "ring-2 ring-indigo-500" : ""}`}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <SparklesIcon className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Blog Image Section */}
        <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
          {blog.image ? (
            <>
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </>
          ) : (
            <div
              className={`h-full flex items-center justify-center ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="text-center p-4">
                <BookmarkIcon className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  No preview available
                </p>
              </div>
            </div>
          )}

          {/* Category Tag */}
          {blog.category && (
            <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              {blog.category}
            </span>
          )}
        </div>

        {/* Blog Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title */}
          <h2
            className={`text-xl font-bold mb-3 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {blog.title}
          </h2>

          {/* Author & Date */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-300" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {blog.author?.username || "Unknown"}
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-3 h-3" />
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Description */}
          <p
            className={`text-sm mb-5 line-clamp-3 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {blog.excerpt || (blog.content || "").replace(/[#*`]/g, "").slice(0, 150)}
            {!blog.excerpt && (blog.content || "").length > 150 ? "..." : ""}
          </p>

          {/* Stats Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex gap-2">
              {/* Likes */}
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs transition ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Likes"
              >
                <HeartIcon className="w-4 h-4" />
                <span>{blog.likes?.length || 0}</span>
              </div>
              {/* Views */}
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs transition ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Views"
              >
                <EyeIcon className="w-4 h-4" />
                <span>{blog.views || 0}</span>
              </div>
              {/* Comments */}
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs transition ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Comments"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{blog.comments?.length || 0}</span>
              </div>
            </div>

            {/* Read Time */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {Math.max(1, Math.ceil((blog.content?.split(/\s+/).length || 0) / 200))} min read
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
