import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBlog } from "../features/blog/blogSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImagePlus, Loader2, PenSquare } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            toast.info(`Uploading: ${progress}%`, {
              toastId: "upload-progress",
              autoClose: false,
              closeButton: false
            });
          }
        }
      );
      toast.dismiss("upload-progress");
      return data.filePath;
    } catch (err) {
      toast.error("Image upload failed. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      return toast.error("Title and content are required.");
    }

    let uploadedImageUrl = null;
    if (imageFile) {
      uploadedImageUrl = await handleImageUpload();
      if (!uploadedImageUrl) return;
    }

    try {
      const blogData = { title, content, ...(uploadedImageUrl && { image: uploadedImageUrl }) };
      await dispatch(createBlog(blogData)).unwrap();
      toast.success("🎉 Blog created successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to create blog. Please try again.");
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

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-500/20"></div>

              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="relative z-10"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Craft Your Story
                </h1>
                <p className="text-indigo-100 text-lg">
                  Share your thoughts with the world
                </p>
              </motion.div>
            </div>

            {/* Main form content */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              {/* Title input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blog Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="An eye-catching title..."
                  required
                  className="w-full px-5 py-4 text-lg border-0 bg-white/80 dark:bg-gray-700/60 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500"
                />
              </motion.div>

              {/* Content textarea */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Story
                </label>
                <textarea
                  rows="10"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts here... (Markdown supported)"
                  required
                  className="w-full px-5 py-4 text-base border-0 bg-white/80 dark:bg-gray-700/60 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 resize-none transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500 leading-relaxed"
                ></textarea>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Supports markdown formatting for rich content
                </p>
              </motion.div>

              {/* Image upload */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className={`flex flex-col items-center justify-center gap-4 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isDragging
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                        : imagePreview
                          ? 'border-transparent'
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-500 bg-white/70 dark:bg-gray-700/40'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <motion.div
                        className="relative w-full h-64"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-md flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Change Image
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="text-center"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="p-4 bg-indigo-100/80 dark:bg-indigo-900/30 rounded-full inline-block mb-4">
                          <ImagePlus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {isDragging ? "Drop your image here" : "Drag & drop your image"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          or click to browse (JPEG, PNG, max 5MB)
                        </p>
                      </motion.div>
                    )}
                  </label>
                </div>
              </motion.div>

              {/* Submit button */}
              <motion.div
                className="pt-6 flex justify-end"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {(isLoading || isUploading) && (
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-indigo-700/30 to-purple-700/30"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear"
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center">
                    {isLoading || isUploading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        {isUploading ? 'Uploading...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        <PenSquare className="w-5 h-5" />
                        Publish Story
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>

        {/* <Footer /> */}
      </div>
    </>
  );
}

