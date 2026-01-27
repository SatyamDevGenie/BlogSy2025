import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBlog } from "../features/blog/blogSlice";
import { uploadAPI } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  ImagePlus, 
  Loader2, 
  PenSquare, 
  Eye, 
  Save, 
  Tag, 
  FileText,
  Clock,
  Globe
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState("published");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const darkMode = useSelector((state) => state.theme.darkMode);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Auto-generate meta title and description
  useEffect(() => {
    if (title && !metaTitle) {
      setMetaTitle(title);
    }
  }, [title, metaTitle]);

  useEffect(() => {
    if (excerpt && !metaDescription) {
      setMetaDescription(excerpt);
    } else if (content && !metaDescription && !excerpt) {
      setMetaDescription(content.substring(0, 160) + "...");
    }
  }, [excerpt, content, metaDescription]);

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 
    'Business', 'Education', 'Entertainment', 'Sports', 'Other'
  ];

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    // Show upload progress toast
    toast.info("Uploading image...", {
      toastId: "upload-progress",
      autoClose: false,
      closeButton: false
    });

    try {
      const response = await uploadAPI.uploadImage(formData);
      toast.dismiss("upload-progress");
      
      // Handle both old and new response formats
      const filePath = response.data?.filePath || response.data?.data?.filePath;
      if (!filePath) {
        throw new Error("No file path returned from server");
      }
      
      toast.success("Image uploaded successfully!");
      return filePath;
    } catch (err) {
      console.error("Image upload error:", err);
      toast.dismiss("upload-progress");
      
      let errorMessage = "Image upload failed. Please try again.";
      if (err.response?.status === 401) {
        errorMessage = "Please log in again to upload images.";
      } else if (err.response?.status === 413) {
        errorMessage = "Image file is too large. Please choose a smaller image.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const MIN_CONTENT_LENGTH = 20;

  const handleSubmit = async (e, statusOverride) => {
    e?.preventDefault?.();
    const submitStatus = statusOverride ?? status;
    if (!title || !content) {
      return toast.error("Title and content are required.");
    }
    if (content.trim().length < MIN_CONTENT_LENGTH) {
      return toast.error(`Content must be at least ${MIN_CONTENT_LENGTH} characters (currently ${content.trim().length}).`);
    }

    let uploadedImageUrl = null;
    if (imageFile) {
      uploadedImageUrl = await handleImageUpload();
      if (!uploadedImageUrl) return;
    }

    try {
      const blogData = { 
        title, 
        content, 
        excerpt: excerpt || content.substring(0, 300) + "...",
        category,
        tags,
        status: submitStatus,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160) + "...",
        ...(uploadedImageUrl && { image: uploadedImageUrl }) 
      };
      
      await dispatch(createBlog(blogData)).unwrap();
      toast.success(`🎉 Blog ${submitStatus === 'draft' ? 'saved as draft' : 'published'} successfully!`);
      navigate(submitStatus === 'draft' ? "/dashboard" : "/");
    } catch (error) {
      const msg = typeof error === 'string' ? error : (error?.message || error?.response?.data?.message);
      toast.error(msg || "Failed to create blog. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    toast.success("Image selected successfully!");
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const tabs = [
    { id: "content", label: "Content", icon: FileText },
    { id: "settings", label: "Settings", icon: Globe },
    { id: "preview", label: "Preview", icon: Eye }
  ];

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pt-20 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <motion.div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold mb-2">Create New Blog</h1>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Share your thoughts with the world
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Tabs */}
                <div className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <nav className="flex space-x-8 px-6">
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
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "content" && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Title */}
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Title *
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter your blog title..."
                            required
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          />
                        </div>

                        {/* Excerpt */}
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Excerpt (Optional)
                          </label>
                          <textarea
                            rows="3"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief description of your blog..."
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
                          />
                          <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {(excerpt || "").length}/300 characters
                          </p>
                        </div>

                        {/* Content */}
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Content *
                          </label>
                          <textarea
                            rows="12"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your blog content here... (Markdown supported)"
                            required
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed`}
                          />
                          <div className="flex justify-between mt-2">
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Supports Markdown formatting
                            </p>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} flex items-center gap-1`}>
                              <Clock className="w-3 h-3" />
                              {calculateReadingTime(content)} min read
                            </p>
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Cover Image (Optional)
                          </label>
                          <div className="relative group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="imageUpload"
                            />
                            <label
                              htmlFor="imageUpload"
                              className={`flex flex-col items-center justify-center gap-4 p-6 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                                isDragging
                                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                                  : imagePreview
                                    ? 'border-transparent'
                                    : `border-gray-300 dark:border-gray-600 group-hover:border-indigo-500 ${
                                        darkMode ? "bg-gray-700/40" : "bg-gray-50"
                                      }`
                              }`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              {imagePreview ? (
                                <div className="relative w-full h-48">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                                      <Upload className="w-4 h-4" />
                                      Change Image
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                                        setImageFile(null);
                                        setImagePreview(null);
                                        toast.info("Cover image removed");
                                      }}
                                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                                    >
                                      Remove Image
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className={`p-3 rounded-full inline-block mb-3 ${
                                    darkMode ? "bg-indigo-900/30" : "bg-indigo-100"
                                  }`}>
                                    <ImagePlus className={`w-6 h-6 ${
                                      darkMode ? "text-indigo-400" : "text-indigo-600"
                                    }`} />
                                  </div>
                                  <h3 className={`font-medium mb-1 ${
                                    darkMode ? "text-gray-300" : "text-gray-700"
                                  }`}>
                                    {isDragging ? "Drop your image here" : "Drag & drop your image"}
                                  </h3>
                                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    or click to browse (JPEG, PNG, max 5MB)
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "settings" && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Category */}
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white" 
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Tags */}
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Tags
                          </label>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={handleTagKeyPress}
                              placeholder="Add a tag..."
                              className={`flex-1 px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                            />
                            <button
                              type="button"
                              onClick={addTag}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Tag className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {tags.length}/10 tags
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white" 
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>

                        {/* SEO Settings */}
                        <div className="space-y-4">
                          <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                            SEO Settings
                          </h3>
                          
                          <div>
                            <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Meta Title
                            </label>
                            <input
                              type="text"
                              value={metaTitle}
                              onChange={(e) => setMetaTitle(e.target.value)}
                              placeholder="SEO title (auto-generated from title)"
                              className={`w-full px-4 py-3 rounded-lg border ${
                                darkMode 
                                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                            />
                            <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {metaTitle.length}/60 characters
                            </p>
                          </div>

                          <div>
                            <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Meta Description
                            </label>
                            <textarea
                              rows="3"
                              value={metaDescription}
                              onChange={(e) => setMetaDescription(e.target.value)}
                              placeholder="SEO description (auto-generated from excerpt)"
                              className={`w-full px-4 py-3 rounded-lg border ${
                                darkMode 
                                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
                            />
                            <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {metaDescription.length}/160 characters
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "preview" && (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className={`p-6 rounded-lg border ${darkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}>
                          <h2 className="text-2xl font-bold mb-4">{title || "Your Blog Title"}</h2>
                          {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-4" />
                          )}
                          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {calculateReadingTime(content)} min read
                            </span>
                            <span>Category: {category}</span>
                            {tags.length > 0 && (
                              <span>Tags: {tags.join(", ")}</span>
                            )}
                          </div>
                          {excerpt && (
                            <p className={`mb-4 italic ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {excerpt}
                            </p>
                          )}
                          <div className="prose prose-lg max-w-none">
                            <pre className="whitespace-pre-wrap font-sans">
                              {content || "Your blog content will appear here..."}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className={`px-6 py-2 rounded-lg border ${
                        darkMode 
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      } transition-colors`}
                    >
                      Cancel
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, "draft")}
                        disabled={isLoading || isUploading}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        Save Draft
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isLoading || isUploading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                      >
                        {isLoading || isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isUploading ? 'Uploading...' : 'Publishing...'}
                          </>
                        ) : (
                          <>
                            <PenSquare className="w-4 h-4" />
                            Publish
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg border ${darkMode ? "border-gray-700" : "border-gray-200"} p-6 sticky top-24`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold mb-4">Blog Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Words:</span>
                    <span>{content.split(/\s+/).filter(word => word.length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Characters:</span>
                    <span>{content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Reading time:</span>
                    <span>{calculateReadingTime(content)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Quick Tips</h4>
                  <ul className={`text-sm space-y-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <li>• Use markdown for formatting</li>
                    <li>• Add relevant tags for better discovery</li>
                    <li>• Include a compelling excerpt</li>
                    <li>• Optimize your SEO settings</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

