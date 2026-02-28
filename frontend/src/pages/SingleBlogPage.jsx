import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getUserProfile, toggleFavourite } from "../features/user/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  HeartIcon,
  UserPlusIcon,
  UserMinusIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  CalendarIcon,
  TagIcon,
  FaceSmileIcon
} from "@heroicons/react/24/solid";
import { 
  HeartIcon as HeartOutline,
  BookmarkIcon as BookmarkOutline,
  ShareIcon as ShareOutline
} from "@heroicons/react/24/outline";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { blogAPI } from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Emoji reactions (like/fast react on comments)
const COMMENT_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

// Rich emoji list for inserting into comment/reply text (real-world style)
const EMOJI_PICKER_LIST = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😎",
  "👍", "👎", "👏", "🙌", "🤝", "🙏", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💕", "💖", "💗", "💘", "💝",
  "🔥", "⭐", "✨", "💫", "🌟", "✅", "❌", "❗", "❓", "💯", "🎉", "🎊", "🙈", "🙉", "🙊", "👀", "💪", "🤔", "😭", "🥺"
];

export default function SingleBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [emojiLoading, setEmojiLoading] = useState(null); // "commentId" or "commentId-replyId"
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null); // null | 'comment' | commentId (for reply)

  const darkMode = useSelector((state) => state.theme.darkMode);
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.user.profile);
  const token = user?.token;

  const fetchBlog = async () => {
    try {
      const res = await blogAPI.getById(id);
      const blogData = res.data?.blog ?? res.data;
      setBlog(blogData);

      if (token && blogData?.author?._id !== user?._id) {
        checkFollowStatus(blogData.author._id);
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
        withCredentials: true
      };

      const res = await axios.get(
        `http://localhost:5000/api/users/${authorId}/follow-status`,
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
      dispatch(getUserProfile());
    } else {
      setError("You need to be logged in to view this blog.");
      setLoading(false);
    }
  }, [id, token, dispatch]);

  // Initialize isFavorited from profile when blog is loaded
  useEffect(() => {
    if (!blog?._id || !profile?.user?.favourites) return;
    const favs = profile.user.favourites;
    const inFavs = favs.some((f) => (typeof f === "object" ? f._id : f) === blog._id);
    setIsFavorited(inFavs);
  }, [blog?._id, profile?.user?.favourites]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      };
      await axios.delete(
        `http://localhost:5000/api/blogs/${id}`,
        config
      );
      toast.success("✅ Blog Deleted Successfully");
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
        withCredentials: true
      };
      const res = await axios.post(
        `http://localhost:5000/api/blogs/${id}/comment`,
        { comment },
        config
      );
      const updated = res.data?.blog || res.data;
      setBlog(updated);
      setComment("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to post comment.");
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      return toast.warning("⚠️ Please login to like the blog.");
    }

    try {
      setLikeLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      };

      const res = await axios.put(
        `http://localhost:5000/api/blogs/${id}/like`,
        {},
        config
      );
      const updatedBlog = res.data?.blog || res.data;
      setBlog(updatedBlog);

      const isLiked = updatedBlog?.likes?.some(like => 
        typeof like === 'string' ? like === user._id : like._id === user._id
      );
      toast.success(isLiked ? "❤️ You liked the blog" : "💔 You unliked the blog");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to like blog.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) return toast.warning("⚠️ Please login to favorite the blog.");

    try {
      setFavLoading(true);
      const result = await dispatch(toggleFavourite(id)).unwrap();
      setIsFavorited(Boolean(result?.isFavorited));
      toast.success(result?.message || "Action completed successfully");
    } catch (err) {
      toast.error(err || "Failed to update favorite.");
    } finally {
      setFavLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return toast.warning("⚠️ Please login to follow users");

    try {
      setFollowLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      };

      const endpoint = isFollowing ? "unfollow" : "follow";
      await axios.put(
        `http://localhost:5000/api/users/${endpoint}/${blog.author._id}`,
        {},
        config
      );

      setIsFollowing(!isFollowing);
      toast.success(
        isFollowing
          ? "❌ You unfollowed this author"
          : "✅ You are now following this author"
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
    setShowShareModal(false);
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim() || !user) return;
    setReplyLoading(true);
    try {
      const res = await blogAPI.replyToComment(id, commentId, { comment: replyText.trim() });
      setBlog(res.data);
      setReplyText("");
      setReplyingToCommentId(null);
      setShowEmojiPickerFor(null);
      toast.success("Reply posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEmojiReaction = async (commentId, emoji, replyId = null) => {
    if (!user) {
      toast.warning("Please login to react.");
      return;
    }
    const key = replyId ? `${commentId}-${replyId}` : commentId;
    setEmojiLoading(key);
    try {
      const res = await blogAPI.addEmojiReaction(id, commentId, replyId ? { emoji, replyId } : { emoji });
      setBlog(res.data);
      toast.success("Reaction added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add reaction.");
    } finally {
      setEmojiLoading(null);
    }
  };

  const handleInsertEmoji = (forTarget, emoji) => {
    if (forTarget === "comment") {
      setComment((prev) => prev + emoji);
    } else {
      setReplyText((prev) => prev + emoji);
    }
  };

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const isOwner = user && blog?.author?._id === user._id;
  const isLikedByUser = blog?.likes?.some(like =>
    typeof like === "string" ? like === user?._id : like._id === user?._id
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center p-6 max-w-md">
          <div className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-4">
            Blog not found.
          </div>
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

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
    <>
      <Navbar />
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        {/* Hero Section with Background Image */}
        <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden mt-12">
          {blog.image ? (
            <>
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </>
          ) : (
            <div className={`w-full h-full ${darkMode ? "bg-gray-800" : "bg-gray-200"} flex items-center justify-center`}>
              <div className="text-center">
                <BookmarkIcon className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No cover image</p>
              </div>
            </div>
          )}

          {/* Navigation Overlay */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <Link
              to="/"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 hover:bg-black/50 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </Link>

            {isOwner && (
              <div className="flex gap-3">
                <Link
                  to={`/edit-blog/${blog._id}`}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 hover:bg-black/50 transition-all duration-200"
                >
                  <PencilSquareIcon className="h-6 w-6 text-blue-400" />
                </Link>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 hover:bg-black/50 transition-all duration-200"
                >
                  <TrashIcon className="h-6 w-6 text-red-400" />
                </button>
              </div>
            )}
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
              >
                {blog.title}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90"
              >
                {blog.category && (
                  <>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                      {blog.category}
                    </span>
                    <span className="text-white/60 hidden sm:inline">•</span>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {blog.author?.username?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <span className="font-medium">{blog.author?.username || "Anonymous"}</span>
                </div>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{calculateReadingTime(blog.content)} min read</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${
              darkMode ? "bg-gray-800/95" : "bg-white/95"
            } backdrop-blur-lg rounded-2xl shadow-2xl border ${
              darkMode ? "border-gray-700/50" : "border-gray-200/50"
            } overflow-hidden`}
          >
            {/* Author Info & Actions Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {blog.author?.username?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{blog.author?.username || "Anonymous"}</h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Published {timeAgo(blog.createdAt)}
                    </p>
                  </div>
                </div>

                {user && !isOwner && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      isFollowing
                        ? `${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"} hover:bg-red-100 hover:text-red-600`
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {followLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        {isFollowing ? "Unfollowing..." : "Following..."}
                      </div>
                    ) : (
                      <>
                        {isFollowing ? (
                          <>
                            <UserMinusIcon className="w-4 h-4 inline mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="w-4 h-4 inline mr-2" />
                            Follow
                          </>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Blog Content */}
            <div className="p-8">
              {/* Category & Tags */}
              {(blog.category || blog.tags?.length > 0) && (
                <div className="mb-8 flex flex-wrap items-center gap-3">
                  {blog.category && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      darkMode ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {blog.category}
                    </span>
                  )}
                  {blog.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <TagIcon className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Excerpt */}
              {blog.excerpt && (
                <div className="mb-8">
                  <p className={`text-lg leading-relaxed italic ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } border-l-4 border-indigo-500 pl-6`}>
                    {blog.excerpt}
                  </p>
                </div>
              )}

              {/* Main Content */}
              <div className="prose prose-lg max-w-none">
                <div className={`${
                  darkMode ? "text-gray-200" : "text-gray-800"
                } leading-relaxed text-justify whitespace-pre-line`}>
                  {blog.content}
                </div>
              </div>

              {/* Reading Stats */}
              <div className={`mt-8 pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <EyeIcon className="w-4 h-4 text-gray-500" />
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                        {blog.views || 0} views
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                        {calculateReadingTime(blog.content)} min read
                      </span>
                    </div>
                  </div>
                  <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Last updated {timeAgo(blog.updatedAt || blog.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className={`px-8 py-6 border-t ${darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50/50"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={handleLikeToggle}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isLikedByUser
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : `${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} text-gray-600 dark:text-gray-400`
                    }`}
                  >
                    {isLikedByUser ? (
                      <HeartIcon className="w-5 h-5" />
                    ) : (
                      <HeartOutline className="w-5 h-5" />
                    )}
                    <span className="font-medium">{blog.likes?.length || 0}</span>
                    {likeLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                  </button>

                  {/* Comment Count */}
                  <div className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span className="font-medium">{blog.comments?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Favorite Button */}
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={favLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isFavorited
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : `${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} text-gray-600 dark:text-gray-400`
                    }`}
                  >
                    {isFavorited ? (
                      <BookmarkIcon className="w-5 h-5" />
                    ) : (
                      <BookmarkOutline className="w-5 h-5" />
                    )}
                    {favLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    } text-gray-600 dark:text-gray-400`}
                  >
                    <ShareOutline className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 mb-20"
          >
            <div className={`${
              darkMode ? "bg-gray-800/95" : "bg-white/95"
            } backdrop-blur-lg rounded-2xl shadow-2xl border ${
              darkMode ? "border-gray-700/50" : "border-gray-200/50"
            } overflow-hidden`}>
              {/* Comments Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ChatBubbleLeftIcon className="w-6 h-6 text-indigo-600" />
                  Comments
                  <span className={`text-sm font-normal px-3 py-1 rounded-full ${
                    darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}>
                    {blog.comments?.length || 0}
                  </span>
                </h2>
              </div>

              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {user.username?.charAt(0).toUpperCase() || "Y"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts..."
                          rows="3"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode 
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === "comment" ? null : "comment")}
                          className={`absolute bottom-3 right-3 p-1.5 rounded-lg transition-colors ${
                            darkMode ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                          }`}
                          title="Add emoji"
                        >
                          <FaceSmileIcon className="w-5 h-5" />
                        </button>
                        {showEmojiPickerFor === "comment" && (
                          <div className={`absolute bottom-full left-0 mb-2 p-3 rounded-xl shadow-lg border max-h-48 overflow-y-auto ${
                            darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                          }`}>
                            <p className={`text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Insert emoji</p>
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {EMOJI_PICKER_LIST.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleInsertEmoji("comment", emoji)}
                                  className="text-lg hover:scale-125 transition-transform p-0.5"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {commentError && (
                        <p className="mt-2 text-sm text-red-500">{commentError}</p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={loading || !comment.trim()}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Posting..." : "Post Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Sign in
                    </Link>{" "}
                    to join the conversation
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {blog.comments?.length > 0 ? (
                  blog.comments.map((comment) => (
                    <div key={comment._id} className="p-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{comment.user?.username || "User"}</h4>
                            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {timeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} leading-relaxed whitespace-pre-wrap`}>
                            {comment.text || comment.comment}
                          </p>
                          {/* Emoji reactions on comment */}
                          {user && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              {COMMENT_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  disabled={emojiLoading === comment._id}
                                  onClick={() => handleEmojiReaction(comment._id, emoji)}
                                  className={`text-lg p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${emojiLoading === comment._id ? "opacity-50" : ""}`}
                                  title={`React ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Reply button */}
                          {user && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToCommentId(replyingToCommentId === comment._id ? null : comment._id);
                                  setShowEmojiPickerFor(null);
                                }}
                                className={`text-sm font-medium ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
                              >
                                {replyingToCommentId === comment._id ? "Cancel" : "Reply"}
                              </button>
                            </div>
                          )}
                          {/* Reply form */}
                          {replyingToCommentId === comment._id && (
                            <div className="mt-3 flex gap-2 items-start">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === comment._id ? null : comment._id)}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${darkMode ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-500"}`}
                                  title="Add emoji"
                                >
                                  <FaceSmileIcon className="w-4 h-4" />
                                </button>
                                {showEmojiPickerFor === comment._id && (
                                  <div className={`absolute bottom-full left-0 mb-2 p-3 rounded-xl shadow-lg border max-h-40 overflow-y-auto z-10 ${
                                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                                  }`}>
                                    <p className={`text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Insert emoji</p>
                                    <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                                      {EMOJI_PICKER_LIST.map((emoji) => (
                                        <button
                                          key={emoji}
                                          type="button"
                                          onClick={() => handleInsertEmoji(comment._id, emoji)}
                                          className="text-base hover:scale-125 transition-transform p-0.5"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={replyLoading || !replyText.trim()}
                                onClick={() => handleReplySubmit(comment._id)}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex-shrink-0"
                              >
                                {replyLoading ? "Posting..." : "Post Reply"}
                              </button>
                            </div>
                          )}
                          {/* Replies */}
                          {comment.replies?.length > 0 && (
                            <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-600 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply._id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-medium">
                                      {reply.user?.username?.charAt(0).toUpperCase() || "R"}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{reply.user?.username || "User"}</span>
                                      <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                        {timeAgo(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-pre-wrap`}>
                                      {reply.comment}
                                    </p>
                                    {user && (
                                      <div className="flex items-center gap-1 mt-1">
                                        {COMMENT_EMOJIS.map((emoji) => (
                                          <button
                                            key={emoji}
                                            type="button"
                                            disabled={emojiLoading === `${comment._id}-${reply._id}`}
                                            onClick={() => handleEmojiReaction(comment._id, emoji, reply._id)}
                                            className={`text-base p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${emojiLoading === `${comment._id}-${reply._id}` ? "opacity-50" : ""}`}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      No comments yet
                    </h3>
                    <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                      Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
                  Are you sure you want to delete this blog? This action cannot be undone.
                </p>
                <div className="flex gap-3">
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

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowShareModal(false)}
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
                <h3 className="text-lg font-semibold mb-4">Share this blog</h3>
                <div className="space-y-3">
                  <button
                    onClick={copyToClipboard}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"
                    } transition-colors text-left`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <ShareIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span>Copy link</span>
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}