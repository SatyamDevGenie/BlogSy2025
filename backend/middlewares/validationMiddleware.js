import Joi from 'joi';

// 🛡️ Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// 📝 User registration validation schema
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    })
});

// 🔑 User login validation schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// 📝 Blog creation validation schema
export const createBlogSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  content: Joi.string()
    .min(50)
    .required()
    .messages({
      'string.min': 'Content must be at least 50 characters long',
      'any.required': 'Content is required'
    }),
  
  excerpt: Joi.string()
    .max(300)
    .optional(),
  
  image: Joi.string()
    .uri()
    .optional()
    .allow(''),
  
  category: Joi.string()
    .valid('Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Entertainment', 'Sports', 'Other')
    .default('Other'),
  
  tags: Joi.array()
    .items(Joi.string().max(20))
    .max(10)
    .optional(),
  
  status: Joi.string()
    .valid('draft', 'published')
    .default('published'),
  
  metaTitle: Joi.string()
    .max(60)
    .optional(),
  
  metaDescription: Joi.string()
    .max(160)
    .optional()
});

// ✏️ Blog update validation schema
export const updateBlogSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .optional(),
  
  content: Joi.string()
    .min(50)
    .optional(),
  
  excerpt: Joi.string()
    .max(300)
    .optional(),
  
  image: Joi.string()
    .uri()
    .optional()
    .allow(''),
  
  category: Joi.string()
    .valid('Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Entertainment', 'Sports', 'Other')
    .optional(),
  
  tags: Joi.array()
    .items(Joi.string().max(20))
    .max(10)
    .optional(),
  
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .optional(),
  
  metaTitle: Joi.string()
    .max(60)
    .optional(),
  
  metaDescription: Joi.string()
    .max(160)
    .optional()
});

// 💬 Comment validation schema
export const commentSchema = Joi.object({
  comment: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment cannot exceed 1000 characters',
      'any.required': 'Comment is required'
    })
});

// 👤 Profile update validation schema
export const updateProfileSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .optional(),
  
  email: Joi.string()
    .email()
    .optional(),
  
  bio: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  
  website: Joi.string()
    .uri()
    .optional()
    .allow(''),
  
  location: Joi.string()
    .max(100)
    .optional()
    .allow(''),
  
  avatar: Joi.string()
    .uri()
    .optional()
    .allow(''),
  
  isPrivate: Joi.boolean()
    .optional(),
  
  allowFollowRequests: Joi.boolean()
    .optional(),
  
  emailNotifications: Joi.object({
    newFollower: Joi.boolean().optional(),
    blogLikes: Joi.boolean().optional(),
    blogComments: Joi.boolean().optional(),
    mentions: Joi.boolean().optional()
  }).optional()
});

// 🔐 Password reset validation schema
export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    })
});

// 📧 Email validation schema
export const emailSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Export validation middleware
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateCreateBlog = validate(createBlogSchema);
export const validateUpdateBlog = validate(updateBlogSchema);
export const validateComment = validate(commentSchema);
export const validateUpdateProfile = validate(updateProfileSchema);
export const validateResetPassword = validate(resetPasswordSchema);
export const validateEmail = validate(emailSchema);