import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBlog } from "../features/blog/blogSlice";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Save, UploadCloud, Image, Loader2, ArrowLeft } from "lucide-react";
import { uploadAPI } from "../utils/api";
import Navbar from "../components/Navbar";

export default function EditBlogPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.blog);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [errorBlog, setErrorBlog] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const res = await axios.get(
          `http://localhost:5000/api/blogs/${id}`,
          config
        );
        const blog = res.data?.blog || res.data;

        setFormData({
          title: blog.title,
          content: blog.content,
          image: blog.image || "",
        });
        setImagePreview(blog.image || "");
        setLoadingBlog(false);
      } catch (err) {
        setErrorBlog("Failed to load blog for editing");
        setLoadingBlog(false);
        toast.error("Failed to load blog data");
      }
    };

    if (user?.token) {
      fetchBlog();
    } else {
      setErrorBlog("Unauthorized access");
      setLoadingBlog(false);
      navigate("/login");
      toast.error("Please login to continue");
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error("Please select an image file (JPEG, PNG)");
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

  const handleImageUpload = async () => {
    if (!imageFile) return formData.image;

    setIsUploading(true);
    const formImg = new FormData();
    formImg.append("image", imageFile);

    toast.info("Uploading image...", {
      toastId: "upload-progress",
      autoClose: false,
      closeButton: false
    });

    try {
      const response = await uploadAPI.uploadImage(formImg);
      toast.dismiss("upload-progress");

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

  const handleRemoveImage = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
    toast.info("Cover image removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const uploadedImage = await handleImageUpload();
      if (imageFile && !uploadedImage) return;

      const updatedData = {
        ...formData,
        image: uploadedImage || formData.image
      };

      await dispatch(updateBlog({ id, formData: updatedData })).unwrap();

      toast.success("🎉 Blog updated successfully!");
      navigate("/");
    } catch (error) {
      toast.error("❌ Failed to update blog");
    }
  };

  if (loadingBlog) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Loading your blog...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (errorBlog) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <motion.div
          className="flex-1 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {errorBlog}. Please try again later.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="flex-1 py-12 pt-24">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
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
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Refine Your Story
                </h1>
                <p className="text-indigo-100 text-lg">
                  Make your blog post even better
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
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 text-lg border-0 bg-white/80 dark:bg-gray-700/60 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500"
                  placeholder="Give your blog a compelling title"
                />
              </motion.div>

              {/* Content textarea */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blog Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  required
                  className="w-full px-5 py-4 text-base border-0 bg-white/80 dark:bg-gray-700/60 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 resize-none transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500 leading-relaxed"
                  placeholder="Pour your thoughts here..."
                ></textarea>
              </motion.div>

              {/* Image upload */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cover Image
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
                            <UploadCloud className="w-4 h-4" />
                            Change Image
                          </div>
                        </div>
                      </motion.div>
                    ) : formData.image ? (
                      <>
                        <img
                          src={formData.image}
                          alt="Current"
                          className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
                        />
                        <div className="text-center">
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            Click to upload a new image
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            or drag and drop (Max 5MB)
                          </p>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        className="text-center"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="p-4 bg-indigo-100/80 dark:bg-indigo-900/30 rounded-full inline-block mb-4">
                          <Image className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
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
                className="pt-6 flex flex-col sm:flex-row justify-end gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {(isLoading) && (
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
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
