// 📦 Import mongoose
import mongoose from "mongoose";

// 👤 Define User Schema with enhanced security
const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true,
      select: false // Don't include password in queries by default
    },
    isAdmin: { type: Boolean, default: false },
    
    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Account security
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLogin: Date,
    refreshToken: String,
    
    // Profile information
    bio: { type: String, maxlength: 500 },
    avatar: { type: String, default: '' },
    website: { type: String },
    location: { type: String },
    
    // Social features
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    
    // Privacy settings
    isPrivate: { type: Boolean, default: false },
    allowFollowRequests: { type: Boolean, default: true },
    
    // Notification preferences
    emailNotifications: {
      newFollower: { type: Boolean, default: true },
      blogLikes: { type: Boolean, default: true },
      blogComments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for follower count
userSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Indexes for performance (removed duplicate email and username indexes since they're already unique in schema)
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// 📤 Export User model
const User = mongoose.model("User", userSchema);
export default User;
