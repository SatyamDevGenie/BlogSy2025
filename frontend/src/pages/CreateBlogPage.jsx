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
        "https://blogsy2025.onrender.com/api/upload",
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
                    className={`flex flex-col items-center justify-center gap-4 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                      isDragging 
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




// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { createBlog } from "../features/blog/blogSlice";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { motion } from "framer-motion";
// import "react-toastify/dist/ReactToastify.css";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// export default function CreateBlogPage() {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isLoading } = useSelector((state) => state.blog);
//   const { user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if (!user) navigate("/login");
//   }, [user, navigate]);

//   const handleImageUpload = async () => {
//     if (!imageFile) return null;
//     setIsUploading(true);
//     const formData = new FormData();
//     formData.append("image", imageFile);

//     try {
//       const { data } = await axios.post(
//         "https://blogsy-deployment.onrender.com/api/upload",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           onUploadProgress: (progressEvent) => {
//             const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             // You could show this progress to the user if you want
//           }
//         }
//       );
//       return data.filePath;
//     } catch (err) {
//       toast.error("Image upload failed. Please try again.");
//       return null;
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title || !content || !imageFile) {
//       return toast.error("All fields are required.");
//     }

//     const uploadedImageUrl = await handleImageUpload();
//     if (!uploadedImageUrl) return;

//     try {
//       const blogData = { title, content, image: uploadedImageUrl };
//       await dispatch(createBlog(blogData)).unwrap();
//       toast.success("✅ Blog Created Successfully");
//       navigate("/");
//     } catch (error) {
//       toast.error("Failed to create blog. Please try again.");
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type and size
//       if (!file.type.match('image.*')) {
//         toast.error("Please select an image file");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         toast.error("Image size should be less than 5MB");
//         return;
//       }
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white min-h-screen pt-12">
//         <motion.div
//           className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//         >
//           <motion.div
//             className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden"
//             initial={{ scale: 0.98, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.1, duration: 0.5 }}
//           >
//             <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
//               <h2 className="text-3xl md:text-4xl font-bold text-white">
//                 ✍️ Create Your Masterpiece
//               </h2>
//               <p className="mt-2 text-blue-100">
//                 Share your thoughts with the world
//               </p>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
//               <motion.div
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Blog Title
//                 </label>
//                 <input
//                   type="text"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="Catchy title that grabs attention..."
//                   required
//                   className="w-full px-5 py-3.5 text-lg border-0 bg-white/70 dark:bg-gray-700/50 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500"
//                 />
//               </motion.div>

//               <motion.div
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Your Story
//                 </label>
//                 <textarea
//                   rows="8"
//                   value={content}
//                   onChange={(e) => setContent(e.target.value)}
//                   placeholder="Pour your heart out... (Markdown supported)"
//                   required
//                   className="w-full px-5 py-4 text-base border-0 bg-white/70 dark:bg-gray-700/50 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 resize-none transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500 leading-relaxed"
//                 ></textarea>
//                 <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
//                   Pro tip: Use markdown for rich formatting
//                 </p>
//               </motion.div>

//               <motion.div
//                 className="space-y-4"
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//               >
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Cover Image
//                 </label>
                
//                 <div className="relative group">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                     required
//                     className="hidden"
//                     id="imageUpload"
//                   />
//                   <label
//                     htmlFor="imageUpload"
//                     className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed ${
//                       imagePreview 
//                         ? 'border-transparent' 
//                         : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
//                     } transition-all cursor-pointer bg-white/50 dark:bg-gray-700/30`}
//                   >
//                     {imagePreview ? (
//                       <motion.div 
//                         className="relative w-full"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <img
//                           src={imagePreview}
//                           alt="Preview"
//                           className="w-full h-72 object-cover rounded-lg shadow-lg"
//                         />
//                         <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                           <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-md">
//                             Change Image
//                           </span>
//                         </div>
//                       </motion.div>
//                     ) : (
//                       <>
//                         <div className="p-4 bg-blue-100/80 dark:bg-blue-900/40 rounded-full">
//                           <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
//                           </svg>
//                         </div>
//                         <div className="text-center">
//                           <p className="font-medium text-gray-700 dark:text-gray-300">
//                             Drag & drop your image here
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                             or click to browse (Max 5MB)
//                           </p>
//                         </div>
//                       </>
//                     )}
//                   </label>
//                 </div>
//               </motion.div>

//               <motion.div
//                 className="pt-4 flex justify-end"
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.5 }}
//               >
//                 <motion.button
//                   type="submit"
//                   disabled={isLoading || isUploading}
//                   className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3 text-lg"
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   {(isLoading || isUploading) && (
//                     <motion.span 
//                       className="absolute inset-0 bg-gradient-to-r from-blue-700/30 to-indigo-700/30"
//                       initial={{ x: '-100%' }}
//                       animate={{ x: '100%' }}
//                       transition={{
//                         repeat: Infinity,
//                         duration: 1.5,
//                         ease: "linear"
//                       }}
//                     />
//                   )}
//                   <span className="relative z-10 flex items-center">
//                     {isLoading || isUploading ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         {isUploading ? 'Uploading...' : 'Publishing...'}
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
//                         </svg>
//                         Publish Now
//                       </>
//                     )}
//                   </span>
//                 </motion.button>
//               </motion.div>
//             </form>
//           </motion.div>
//         </motion.div>

//         <Footer />
//       </div>
//     </>
//   );
// }

