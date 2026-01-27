import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Function to initialize Cloudinary configuration
const initializeCloudinary = () => {
  console.log("Initializing Cloudinary with:");
  console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "***SET***" : "NOT SET");
  console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "***SET***" : "NOT SET");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Initialize storage function
const createStorage = () => {
  initializeCloudinary();
  
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "blogs", // Cloudinary folder
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // allowed image formats
    },
  });
};

// Export a function that creates storage instead of creating it immediately
export { cloudinary, createStorage };

// For backward compatibility, export storage but initialize it lazily
let _storage = null;
export const storage = new Proxy({}, {
  get(target, prop) {
    if (!_storage) {
      _storage = createStorage();
    }
    return _storage[prop];
  }
});
