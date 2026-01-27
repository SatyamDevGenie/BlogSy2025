import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🛡️ Enhanced authentication middleware with multiple token sources
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in multiple places
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      // Bearer token in Authorization header
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      // httpOnly cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // Check if user's email is verified (skip in development)
    if (!user.isEmailVerified && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ 
        message: "Please verify your email address to access this resource" 
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        message: "Account is temporarily locked" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expired", 
        code: "TOKEN_EXPIRED" 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token", 
        code: "INVALID_TOKEN" 
      });
    }
    
    return res.status(401).json({ message: "Not authorized, token verification failed" });
  }
};

// 🔐 Admin authorization middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

// 📝 Blog ownership middleware
const blogOwnership = async (req, res, next) => {
  try {
    const Blog = (await import("../models/Blog.js")).default;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ 
        message: "Not authorized to perform this action on this blog" 
      });
    }

    req.blog = blog;
    next();
  } catch (error) {
    console.error('Blog ownership middleware error:', error);
    res.status(500).json({ message: "Server error checking blog ownership" });
  }
};

// 🔄 Optional authentication middleware (for public routes that benefit from user context)
const optionalAuth = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select('-password -refreshToken -emailVerificationToken -passwordResetToken');
      
      if (user && user.isEmailVerified && (!user.lockUntil || user.lockUntil <= Date.now())) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

export { protect, admin, blogOwnership, optionalAuth };
