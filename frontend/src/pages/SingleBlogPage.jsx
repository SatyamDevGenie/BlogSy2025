import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  HeartIcon,
  UserPlusIcon,
  UserMinusIcon,
} from "@heroicons/react/24/solid";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export default function SingleBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentLiking, setCommentLiking] = useState({}); // Track which comments are being liked

  const darkMode = useSelector((state) => state.theme.darkMode);
  const user = useSelector((state) => state.auth.user);
  const token = user?.token;

  const fetchBlog = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `https://blogsy-2025.onrender.com/api/blogs/${id}`,
        config
      );
      setBlog(res.data);

      if (token && res.data.author?._id !== user?._id) {
        checkFollowStatus(res.data.author._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch blog.");
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (authorId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.get(
        `https://blogsy-2025.onrender.com/api/users/${authorId}/follow-status`,
        config
      );
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBlog();
    } else {
      setError("You need to be logged in to view this blog.");
      setLoading(false);
    }
  }, [id, token]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(
        `https://blogsy-2025.onrender.com/api/blogs/${id}`,
        config
      );
      toast.success("✅ Blog Deleted Successfully", {
        position: "top-center",
      });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete blog.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError("");

    if (!comment.trim()) {
      return setCommentError("Comment cannot be empty.");
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const res = await axios.post(
        `https://blogsy-2025.onrender.com/api/blogs/${id}/comment`,
        { comment },
        config
      );
      setBlog((prev) => ({
        ...res.data,
        author: prev.author,
      }));
      setComment("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to post comment.");
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      return toast.warning("⚠️ Please login to like the blog.", {
        position: "top-center",
      });
    }

    try {
      setLikeLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.put(
        `https://blogsy-2025.onrender.com/api/blogs/${id}/like`,
        {},
        config
      );

      setBlog((prev) => ({
        ...prev,
        likes: res.data.likes,
      }));

      const isLiked = res.data.likes.includes(user._id);

      if (isLiked) {
        toast.success("❤️ You liked the blog", {
          position: "bottom-center",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to like blog.", {
        position: "bottom-center",
      });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user)
      return toast.warning("⚠️ Please login to favorite the blog.", {
        position: "top-center",
      });

    try {
      setFavLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.put(
        `https://blogsy-2025.onrender.com/api/users/favourites/${id}`,
        {},
        config
      );

      const message = res.data.message || "Action completed successfully";
      toast.success(message, {
        position: "bottom-center",
      });

      setBlog((prev) => ({
        ...prev,
        favorites: res.data.favorites,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to favorite blog.", {
        position: "bottom-center",
      });
    } finally {
      setFavLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user)
      return toast.warning("⚠️ Please login to follow users", {
        position: "top-center",
      });

    try {
      setFollowLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const endpoint = isFollowing ? "unfollow" : "follow";
      const res = await axios.put(
        `https://blogsy-2025.onrender.com/api/users/${endpoint}/${blog.author._id}`,
        {},
        config
      );

      setIsFollowing(!isFollowing);
      toast.success(
        isFollowing
          ? "❌ You unfollowed this author"
          : "✅ You are now following this author",
        {
          position: "top-center",
        }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update follow status",
        {
          position: "top-center",
        }
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) {
      return toast.warning("⚠️ Please login to like comments", {
        position: "top-center",
      });
    }

    try {
      setCommentLiking((prev) => ({ ...prev, [commentId]: true }));
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.put(
        `https://blogsy-2025.onrender.com/api/blogs/${id}/comments/${commentId}/like`,
        {},
        config
      );

      setBlog((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: res.data.likes }
            : comment
        ),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to like comment.", {
        position: "top-center",
      });
    } finally {
      setCommentLiking((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const isOwner = user && blog?.author?._id === user._id;
  const isLikedByUser = blog?.likes?.includes(user?._id);
  const isFavorited = blog?.favorites?.includes(user?._id);

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-white"
          }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
      >
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  if (!blog)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
      >
        <div className="text-center p-6 max-w-md">
          <div className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-4">
            Blog not found.
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );

  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  return (
    <div
      className={`min-h-screen pb-16 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
    >
      {/* Header Image */}
      <div className="relative w-full overflow-hidden shadow-lg">
        {blog.image && (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-48 sm:h-72 md:h-96 lg:h-[475px] object-fit transition-transform duration-500 hover:scale-105"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/40 shadow-md hover:bg-black/50 hover:scale-110 transition"
          title="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </Link>

        {/* Edit/Delete Buttons for Owner */}
        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-3">
            <Link
              to={`/edit-blog/${blog._id}`}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-md hover:bg-white/50 hover:scale-110 transition"
              title="Edit Blog"
            >
              <PencilSquareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </Link>
            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-md hover:bg-white/50 hover:scale-110 transition"
              title="Delete Blog"
            >
              <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        {/* Glassmorphism Container */}
        <div
          className={`relative max-w-4xl mx-auto rounded-2xl overflow-hidden ${darkMode ? "bg-gray-900/30" : "bg-white"
            } backdrop-blur-lg border ${darkMode ? "border-gray-700/50" : "border-gray-200/80"
            } shadow-xl`}
        >
          <div className="relative p-6 sm:p-8">
            {/* Blog Header */}
            <div className="relative flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
              <div className="flex-1 space-y-3">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 leading-tight tracking-tight">
                  {blog.title}
                </h1>

                {/* Author info */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm mr-2 transition-transform group-hover:scale-110">
                      {blog.author?.username?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {blog.author?.username || "Anonymous"}
                    </span>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              {user && !isOwner && blog.author && (
                <div className="relative sm:absolute sm:right-0 sm:top-0">
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`
                      relative z-10 flex items-center justify-center
                      gap-2 px-4 sm:px-5 py-2
                      rounded-xl font-medium
                      text-sm transition-all duration-300
                      hover:shadow-lg
                      ${isFollowing
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-gray-300/30"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-blue-500/40"
                      }
                      ${followLoading ? "opacity-80 cursor-not-allowed" : ""}
                      overflow-hidden
                    `}
                  >
                    {followLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>{isFollowing ? "Unfollowing" : "Following"}</span>
                      </span>
                    ) : (
                      <>
                        {isFollowing ? (
                          <>
                            <UserMinusIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Follow</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Content Card */}
            <div className="relative mb-10 rounded-xl overflow-hidden">
              <div
                className={`absolute inset-0 ${darkMode ? "bg-gray-800/80" : "bg-white"
                  } opacity-95`}
              ></div>
              <div
                className={`absolute inset-0 ${darkMode ? "opacity-[0.02]" : "opacity-[0.03]"
                  }`}
              ></div>

              <div className="relative prose prose-sm sm:prose-lg max-w-none px-4 sm:px-6 py-6 sm:py-8 text-gray-800 dark:text-gray-200 leading-relaxed">
                <p className="whitespace-pre-line tracking-wide text-justify">
                  {blog.content}
                </p>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t border-gray-200 dark:border-gray-700/50 pt-6 pb-2">
              {/* Like Button */}
              <button
                onClick={handleLikeToggle}
                disabled={likeLoading}
                className={`
                  relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl
                  text-sm font-medium transition-all duration-300
                  ${isLikedByUser
                    ? "text-rose-600 bg-rose-50/80 dark:bg-rose-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                  ${likeLoading ? "opacity-70 cursor-not-allowed" : ""}
                  group
                `}
              >
                <span className="relative">
                  <span
                    className={`text-xl transition-all duration-300 ${isLikedByUser ? "scale-125" : "group-hover:scale-110"
                      }`}
                  >
                    ❤️
                  </span>
                  {isLikedByUser && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-20"></span>
                    </span>
                  )}
                </span>
                <span>{blog.likes?.length || 0}</span>
                {likeLoading && <span className="ml-1 animate-pulse">...</span>}
              </button>

              {/* Views */}
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span className="relative inline-block">
                  <span className="text-lg">👁️</span>
                  <span className="absolute top-0 right-0 -mr-1 -mt-1 flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full ${blog.views > 0 ? "bg-blue-400" : "bg-gray-400"
                        } opacity-75`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${blog.views > 0 ? "bg-blue-500" : "bg-gray-500"
                        }`}
                    ></span>
                  </span>
                </span>
                <span>{blog.views || 0} Views</span>
              </div>

              {/* Favorite Button */}
              <div className="ml-auto">
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favLoading}
                  className={`
                    relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl
                    text-sm font-medium transition-all duration-300
                    ${isFavorited
                      ? "text-rose-600 bg-rose-50/80 dark:bg-rose-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }
                    ${favLoading ? "opacity-70 cursor-not-allowed" : ""}
                    group
                  `}
                >
                  <HeartIcon
                    className={`h-5 w-5 transition-transform ${isFavorited ? "scale-110 fill-rose-600" : "group-hover:scale-110"
                      }`}
                  />
                  <span className="hidden sm:inline">
                    {favLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : isFavorited ? (
                      "Favorited"
                    ) : (
                      "Favorite"
                    )}
                  </span>
                  {isFavorited && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-20"></span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-10 sm:mt-14">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 sm:gap-4">
              <span className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-500/30">
                💬
              </span>
              <span className="tracking-tight">Comments</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/60 px-3 sm:px-4 py-1 rounded-full backdrop-blur">
                {blog.comments?.length || 0}
              </span>
            </h2>
          </div>

          {/* Comment Input */}
          {user ? (
            <form
              onSubmit={handleCommentSubmit}
              className="mb-10 sm:mb-12 relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500"></div>
              <div
                className={`relative flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none ${darkMode ? "bg-gray-900/50" : "bg-white/80"
                  } border ${darkMode ? "border-gray-700/60" : "border-gray-100"
                  } backdrop-blur-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/40`}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md">
                    {user.username?.charAt(0).toUpperCase() || "Y"}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="✨ Share your thoughts..."
                  className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${loading
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-blue-500/30 hover:scale-105"
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                  5.291A7.962 7.962 0 014 12H0c0 3.042 
                  1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Posting
                    </span>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
              {commentError && (
                <p className="mt-3 text-sm text-red-500">{commentError}</p>
              )}
            </form>
          ) : (
            <div
              className={`mb-10 sm:mb-12 p-5 sm:p-6 rounded-2xl ${darkMode ? "bg-gray-900/40" : "bg-gray-100/70"
                } border ${darkMode ? "border-gray-700/40" : "border-gray-200"} text-center backdrop-blur-lg`}
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline font-semibold"
                >
                  Sign in
                </Link>{" "}
                to leave a comment 💭
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-5 sm:space-y-7">
            {blog.comments?.length > 0 ? (
              blog.comments.map((comment) => {
                const isCommentLiked = comment.likes?.includes(user?._id);
                return (
                  <div
                    key={comment._id}
                    className={`relative p-5 sm:p-6 rounded-2xl transition-all duration-300 ${darkMode
                      ? "bg-gray-900/40 hover:bg-gray-900/60"
                      : "bg-white/90 hover:bg-white"
                      } border ${darkMode
                        ? "border-gray-700/40 hover:border-gray-600"
                        : "border-gray-100 hover:border-gray-200"
                      } shadow-md hover:shadow-xl backdrop-blur`}
                  >
                    {/* Comment Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {comment.user?.username || "User"}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comment Body */}
                    <div className="pl-12 sm:pl-14">
                      <p className="text-gray-800 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                        {comment.text || comment.comment}
                      </p>

                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/30">
                        {/* Reserved for future actions */}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className={`p-8 sm:p-10 text-center rounded-2xl ${darkMode ? "bg-gray-900/40" : "bg-gray-100/70"
                  } border ${darkMode ? "border-gray-700/40" : "border-gray-200"} backdrop-blur-lg`}
              >
                <div className="mx-auto w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gray-200/60 dark:bg-gray-700/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 sm:w-9 sm:h-9 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 
              8-9 8a9.863 9.863 0 01-4.255-.949L3 
              20l1.395-3.72C3.512 15.042 3 
              13.574 3 12c0-4.418 4.03-8 9-8s9 
              3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No comments yet 😶
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Be the first to start the conversation!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div
            className={`rounded-lg shadow-lg p-6 w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"
                }`}
            >
              ⚠️ Are you sure you want to delete this blog?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}