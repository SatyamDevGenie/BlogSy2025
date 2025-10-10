import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBlog } from "../features/blog/blogSlice";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, UploadCloud, Image, Loader2, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const res = await axios.get(
          `https://blogsy2025.onrender.com/api/blogs/${id}`, 
          config
        );
        
        setFormData({
          title: res.data.title,
          content: res.data.content,
          image: res.data.image || "",
        });
        setImagePreview(res.data.image || "");
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

    const formImg = new FormData();
    formImg.append("image", imageFile);

    try {
      const { data } = await axios.post(
        "https://blogsy2025.onrender.com/api/upload",
        formImg,
        { 
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`
          },
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
    }
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
      
      
      <main className="flex-1 py-12">
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

      {/* <Footer /> */}
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { updateBlog } from "../features/blog/blogSlice";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { motion } from "framer-motion";
// import "react-toastify/dist/ReactToastify.css";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// export default function EditBlogPage() {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { user } = useSelector((state) => state.auth);
//   const { isLoading } = useSelector((state) => state.blog);

//   const [formData, setFormData] = useState({ 
//     title: "", 
//     content: "", 
//     image: "" 
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [loadingBlog, setLoadingBlog] = useState(true);
//   const [errorBlog, setErrorBlog] = useState("");

//   useEffect(() => {
//     const fetchBlog = async () => {
//       try {
//         const config = {
//           headers: { Authorization: `Bearer ${user.token}` },
//         };
//         const res = await axios.get(
//           `https://blogsy-deployment.onrender.com/api/blogs/${id}`, 
//           config
//         );
        
//         setFormData({
//           title: res.data.title,
//           content: res.data.content,
//           image: res.data.image || "",
//         });
//         setImagePreview(res.data.image || "");
//         setLoadingBlog(false);
//       } catch (err) {
//         setErrorBlog("Failed to load blog for editing");
//         setLoadingBlog(false);
//         toast.error("Failed to load blog data");
//       }
//     };

//     if (user?.token) {
//       fetchBlog();
//     } else {
//       setErrorBlog("Unauthorized access");
//       setLoadingBlog(false);
//       navigate("/login");
//       toast.error("Please login to continue");
//     }
//   }, [id, user, navigate]);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type and size
//     if (!file.type.match('image.*')) {
//       toast.error("Please select an image file (JPEG, PNG)");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image size should be less than 5MB");
//       return;
//     }

//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const handleImageUpload = async () => {
//     if (!imageFile) return formData.image;

//     const formImg = new FormData();
//     formImg.append("image", imageFile);

//     try {
//       const { data } = await axios.post(
//         "https://blogsy-deployment.onrender.com/api/upload",
//         formImg,
//         { 
//           headers: { 
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${user.token}`
//           } 
//         }
//       );
//       return data.filePath;
//     } catch (err) {
//       toast.error("Image upload failed. Please try again.");
//       return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const uploadedImage = await handleImageUpload();
//       if (imageFile && !uploadedImage) return;

//       const updatedData = { 
//         ...formData, 
//         image: uploadedImage || formData.image 
//       };

//       await dispatch(updateBlog({ id, formData: updatedData })).unwrap();
      
//       toast.success("✅ Blog updated successfully");
//       navigate("/");
//     } catch (error) {
//       toast.error("❌ Failed to update blog");
//     }
//   };

//   if (loadingBlog) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Navbar />
//         <motion.div
//           className="flex-1 flex items-center justify-center"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <div className="text-center space-y-4">
//             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="text-lg text-gray-600 dark:text-gray-300">
//               Loading your blog...
//             </p>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   if (errorBlog) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Navbar />
//         <motion.div
//           className="flex-1 flex items-center justify-center px-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <div className="text-center space-y-4 max-w-md">
//             <div className="text-red-500 text-5xl">⚠️</div>
//             <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
//               Oops! Something went wrong
//             </h3>
//             <p className="text-gray-600 dark:text-gray-300">
//               {errorBlog}. Please try again later.
//             </p>
//             <button
//               onClick={() => navigate("/")}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Back to Home
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//       <Navbar />
      
//       <main className="flex-1 py-12">
//         <motion.div
//           className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <motion.div
//             className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
//             initial={{ scale: 0.98 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.1 }}
//           >
//             <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-center">
//               <motion.h1
//                 className="text-3xl sm:text-4xl font-bold text-white"
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 ✨ Edit Your Blog
//               </motion.h1>
//               <motion.p
//                 className="mt-2 text-blue-100"
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 Refine your thoughts and make them shine
//               </motion.p>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
//               <motion.div
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//               >
//                 <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Blog Title
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-5 py-3.5 text-lg border-0 bg-white/70 dark:bg-gray-700/50 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500"
//                   placeholder="Give your blog a compelling title"
//                 />
//               </motion.div>

//               <motion.div
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.5 }}
//               >
//                 <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Blog Content
//                 </label>
//                 <textarea
//                   name="content"
//                   value={formData.content}
//                   onChange={handleChange}
//                   rows={10}
//                   required
//                   className="w-full px-5 py-4 text-base border-0 bg-white/70 dark:bg-gray-700/50 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 resize-none transition-all hover:shadow-md placeholder-gray-400/70 dark:placeholder-gray-500 leading-relaxed"
//                   placeholder="Pour your thoughts here..."
//                 ></textarea>
//               </motion.div>

//               <motion.div
//                 className="space-y-4"
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.6 }}
//               >
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Update Cover Image
//                 </label>
                
//                 <div className="relative group">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileChange}
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
//                     ) : formData.image ? (
//                       <>
//                         <img
//                           src={formData.image}
//                           alt="Current"
//                           className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
//                         />
//                         <div className="text-center">
//                           <p className="font-medium text-gray-700 dark:text-gray-300">
//                             Click to upload a new image
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                             or drag and drop (Max 5MB)
//                           </p>
//                         </div>
//                       </>
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
//                 className="pt-4 flex justify-center sm:justify-end space-x-4"
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.7 }}
//               >
//                 <button
//                   type="button"
//                   onClick={() => navigate(-1)}
//                   className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
//                 >
//                   Cancel
//                 </button>
                
//                 <motion.button
//                   type="submit"
//                   disabled={isLoading}
//                   className="relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   {isLoading && (
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
//                     {isLoading ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Updating...
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                         </svg>
//                         Update Blog
//                       </>
//                     )}
//                   </span>
//                 </motion.button>
//               </motion.div>
//             </form>
//           </motion.div>
//         </motion.div>
//       </main>

//       <Footer />
//     </div>
//   );
// }

