// 📦 Import mongoose
import mongoose from "mongoose";

// 📝 Blog Schema with enhanced features
const blogSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: { 
      type: String, 
      required: true,
      minlength: [20, 'Content must be at least 20 characters']
    },
    excerpt: {
      type: String,
      maxlength: 300
    },
    image: { 
      type: String, 
      default: "" 
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Content organization
    category: {
      type: String,
      enum: ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'],
      default: 'Other'
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    // Publishing status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    scheduledFor: Date,
    
    // Engagement metrics
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    shares: { type: Number, default: 0 },
    
    // Reading metrics
    readingTime: { type: Number, default: 0 }, // in minutes
    
    // SEO fields
    metaTitle: String,
    metaDescription: String,
    
    // Content moderation
    isModerated: { type: Boolean, default: false },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderationNotes: String,
    
    // Featured content
    isFeatured: { type: Boolean, default: false },
    featuredUntil: Date,
    
    // Comments with enhanced structure
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        comment: { type: String, required: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        isEdited: { type: Boolean, default: false },
        
        // Comment moderation
        isModerated: { type: Boolean, default: false },
        isHidden: { type: Boolean, default: false },
        
        // Emoji reactions on comments
        emojis: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            emoji: { type: String, enum: ['👍', '❤️', '😂', '😮', '😢', '😡'] },
            createdAt: { type: Date, default: Date.now }
          },
        ],

        // Nested replies
        replies: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            comment: { type: String, required: true, maxlength: 500 },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
            isEdited: { type: Boolean, default: false },
            
            // Emoji reactions on replies
            emojis: [
              {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                emoji: { type: String, enum: ['👍', '❤️', '😂', '😮', '😢', '😡'] },
                createdAt: { type: Date, default: Date.now }
              },
            ],
          },
        ],
      },
    ],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count (including replies)
blogSchema.virtual('commentCount').get(function() {
  if (!this.comments) return 0;
  return this.comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);
});

// Virtual for engagement score
blogSchema.virtual('engagementScore').get(function() {
  const likes = this.likes ? this.likes.length : 0;
  const comments = this.commentCount || 0;
  const views = this.views || 0;
  const shares = this.shares || 0;
  
  return (likes * 3) + (comments * 5) + (views * 0.1) + (shares * 10);
});

// Pre-save middleware to generate slug and calculate reading time
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  
  if (this.isModified('content')) {
    // Calculate reading time (average 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
    
    // Generate excerpt if not provided
    if (!this.excerpt) {
      this.excerpt = this.content.substring(0, 297) + '...';
    }
  }
  
  next();
});

// Indexes for performance and search (removed duplicate slug index since it's already unique in schema)
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ views: -1 });
blogSchema.index({ 'likes.length': -1 });

// 📤 Export Blog model
const Blog = mongoose.model("Blog", blogSchema);
export default Blog;




