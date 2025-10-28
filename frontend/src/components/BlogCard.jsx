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
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/blogs/${blog._id}`}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border h-[500px] shadow-md hover:shadow-2xl transition-all duration-300 ${darkMode
            ? "bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 text-white"
            : "bg-gradient-to-b from-white to-gray-50 border-gray-200 text-gray-900"
          } ${featured ? "ring-2 ring-indigo-500" : ""}`}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <SparklesIcon className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Image Section */}
        <div className="relative h-52 md:h-56 overflow-hidden">
          {blog.image ? (
            <>
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          ) : (
            <div
              className={`h-full flex flex-col items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
            >
              <BookmarkIcon className="w-10 h-10 text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">No image available</p>
            </div>
          )}

          {/* Category Badge */}
          {blog.category && (
            <span className="absolute bottom-3 left-3 bg-indigo-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              {blog.category}
            </span>
          )}
        </div>

        {/* Blog Info */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title */}
          <h2
            className={`text-lg md:text-xl font-bold leading-snug mb-2 line-clamp-2 transition-colors group-hover:text-indigo-600 ${darkMode ? "text-white" : "text-gray-900"
              }`}
          >
            {blog.title}
          </h2>

          {/* Author & Date */}
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <span>{blog.author?.username || "Anonymous"}</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>

          {/* Description */}
          <p
            className={`text-sm line-clamp-3 mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"
              }`}
          >
            {blog.content.replace(/[#*`]/g, "").slice(0, 150)}...
          </p>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            {/* Stats */}
            <div className="flex gap-2">
              {[
                {
                  icon: HeartIcon,
                  label: "Likes",
                  count: blog.likes?.length || 0,
                },
                {
                  icon: EyeIcon,
                  label: "Views",
                  count: blog.views || 0,
                },
                {
                  icon: ChatBubbleLeftIcon,
                  label: "Comments",
                  count: blog.comments?.length || 0,
                },
              ].map(({ icon: Icon, label, count }) => (
                <div
                  key={label}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-xs transition ${darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span>{count}</span>
                </div>
              ))}
            </div>

            {/* Read Time */}
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {Math.ceil(blog.content.length / 1000) || 1} min read
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


