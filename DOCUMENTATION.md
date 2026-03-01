# BlogSy – Full Documentation

A full-stack MERN (MongoDB, Express, React, Node.js) blogging platform with authentication, CRUD blogs, comments, reactions, categories, admin features, and AI writing assist.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Environment Variables](#environment-variables)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Features Summary](#features-summary)

---

## Overview

- **Stack:** MongoDB, Express.js, React (Vite), Node.js  
- **Auth:** JWT (access + refresh), optional email verification, password reset  
- **Storage:** Cloudinary (images) with local fallback  
- **UI:** Tailwind CSS, Framer Motion, React Three Fiber (hero scene)

---

## Setup & Installation

### Prerequisites

- **Node.js** 18+  
- **MongoDB** (local or Atlas URI)  
- **npm** or **yarn**

### 1. Clone & install

```bash
cd BlogSy2025
npm install
cd frontend && npm install && cd ..
```

### 2. Environment file

Create a `.env` file in the **project root** (`BlogSy2025/`, same level as `package.json`):

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/blogsy
# Or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/blogsy

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Email (Gmail – for welcome emails & password reset)
ADMIN_EMAIL=your@gmail.com
ADMIN_EMAIL_APP_PASSWORD=your-app-password
# Fallback names: EMAIL_USER, EMAIL_PASS

# File upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI (optional – Groq writing assist)
GROQ_API_KEY=your-groq-api-key
```

- **Gmail:** Use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.  
- **Cloudinary:** If not set, uploads fall back to local `uploads/` folder.

### 3. Run the app

**Development (backend + frontend together):**

```bash
npm run dev
```

- Backend: `http://localhost:5000`  
- Frontend: `http://localhost:5173`

**Run separately:**

```bash
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

### 4. Seed data (optional)

```bash
npm run data:import   # Import sample users & blogs
npm run data:destroy  # Remove all users & blogs
```

Default admin user (from seed): **Satyam** / `@Satyam#1234` (see `backend/data/users.js`).

---

## Environment Variables

| Variable | Required | Description |
|--------|----------|-------------|
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default `5000`) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret for access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for refresh tokens |
| `ADMIN_EMAIL` | No | Sender for welcome & reset emails |
| `ADMIN_EMAIL_APP_PASSWORD` | No | Gmail app password |
| `CLOUDINARY_*` | No | Image upload (fallback: local) |
| `GROQ_API_KEY` | No | AI writing assist |

---

## Backend

### Structure

```
backend/
├── config/
│   ├── db.js          # MongoDB connection
│   └── env.js         # Load .env first (before other imports)
├── controllers/
│   ├── authController.js   # Register, login, logout, refresh, verify email, forgot/reset password
│   ├── blogController.js    # CRUD blogs, like, comment, reply, emoji reactions
│   ├── userController.js    # Profile, follow/unfollow, favourites
│   └── aiController.js      # AI writing assist (Groq)
├── middlewares/
│   ├── authMiddleware.js    # protect, admin, blog ownership
│   ├── errorMiddleware.js   # 404, global error handler
│   ├── validationMiddleware.js
│   ├── securityMiddleware.js
│   └── rateLimitMiddleware.js
├── models/
│   ├── User.js
│   └── Blog.js
├── routes/
│   ├── authRoutes.js
│   ├── blogRoutes.js
│   ├── userRoutes.js
│   ├── uploadRoutes.js
│   └── aiRoutes.js
├── utils/
│   ├── cloudinary.js   # Image upload (Cloudinary or local)
│   └── groqService.js  # Groq API for AI
├── data/
│   ├── users.js       # Seed users
│   └── blogs.js       # Seed blogs
├── seeder.js
└── server.js
```

### API Routes

**Auth** (`/api/auth`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | No | Register; sends welcome email if configured |
| POST | `/login` | No | Login; returns user + tokens |
| POST | `/logout` | Yes | Logout |
| GET | `/verify-email/:token` | No | Verify email |
| POST | `/refresh-token` | No | Refresh access token |
| POST | `/forgot-password` | No | Request password reset email |
| POST | `/reset-password/:token` | No | Reset password with token |
| GET | `/me` | Yes | Current user |

**Blogs** (`/api/blogs`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | No | All blogs |
| GET | `/trending` | No | Trending blogs |
| GET | `/latest` | No | Latest blogs |
| GET | `/:id` | Yes | Single blog (increments view for user) |
| POST | `/create` | Yes | Create blog |
| PUT | `/:id` | Yes | Update blog (author or admin; category only by admin) |
| DELETE | `/:id` | Yes | Delete blog (author only) |
| PUT | `/:id/like` | Yes | Like/unlike |
| POST | `/:id/comment` | Yes | Add comment |
| POST | `/:blogId/comments/:commentId/reply` | Yes | Reply to comment |
| POST | `/:blogId/comments/:commentId/emoji` | Yes | Add emoji reaction on comment |

**Users** (`/api/users`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/profile` | Yes | Current user profile |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/follow/:id` | Yes | Follow user |
| PUT | `/unfollow/:id` | Yes | Unfollow user |
| GET | `/:id/follow-status` | Yes | Check if following |
| PUT | `/favourites/:id` | Yes | Toggle favourite blog |
| DELETE | `/favourites/:id` | Yes | Remove favourite |

**Upload** (`/api/upload`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/` | Yes | Upload image (Cloudinary or local) |

**AI** (`/api/ai`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/writing-assist` | Yes | AI writing assist (Groq) |

### Models

**User**

- `username`, `email`, `password` (hashed), `isAdmin`
- Email verification & password reset tokens
- Profile: `bio`, `avatar`, `website`, `location`
- Social: `following`, `followers`, `favourites` (blog refs)
- Notifications and privacy flags

**Blog**

- `title`, `slug`, `content`, `excerpt`, `image`, `author` (ref User)
- `category` (enum: Technology, Lifestyle, Travel, Food, Health, Business, Education, Entertainment, Sports, Other) – set on create; only admin can change on edit
- `tags[]`, `status` (draft | published | archived)
- `likes[]`, `views`, `viewedBy[]`, `readingTime`
- `comments[]`: each has `user`, `comment`, `replies[]`, `emojis[]` (reactions)
- SEO: `metaTitle`, `metaDescription`

### Business rules

- **Category:** Chosen once at blog creation; on edit, only admins can change it; authors see category as read-only.
- **Blog edit/delete:** Author can edit/delete own blog; admin can edit any blog (including category); delete is author-only in current implementation.
- **Token refresh:** Frontend uses refresh token on 401 to get new access token and retry the request.

---

## Frontend

### Structure

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   └── store.js           # Redux store (auth, blog, user, theme)
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── BlogCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── AnimatedBackground.jsx
│   │   ├── HeroScene.jsx       # Three.js particle background
│   │   └── AiWritingAssist.jsx
│   ├── constants/
│   │   └── blogCategories.js   # VALID_BLOG_CATEGORIES (match backend)
│   ├── features/
│   │   ├── auth/
│   │   │   └── authSlice.js
│   │   ├── blog/
│   │   │   └── blogSlice.js
│   │   ├── user/
│   │   │   └── userSlice.js
│   │   └── mode/
│   │       └── themeSlice.js
│   ├── pages/
│   │   ├── HomePage.jsx        # Blog list, search, category filter, sort
│   │   ├── SingleBlogPage.jsx  # Read blog, comments, replies, reactions
│   │   ├── CreateBlogPage.jsx  # Create (title, category, content, image, tags, SEO)
│   │   ├── EditBlogPage.jsx    # Edit (category read-only)
│   │   ├── DashboardPage.jsx    # My blogs; admin: “Manage All Blogs”
│   │   ├── TrendingPage.jsx
│   │   ├── LatestBlogPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── UpdateProfilePage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── VerifyEmailPage.jsx
│   │   └── About.jsx
│   ├── utils/
│   │   ├── api.js              # Axios instance, interceptors, API methods
│   │   └── animations.js       # Framer Motion variants
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

### Routes (React Router)

| Path | Protected | Page |
|------|-----------|------|
| `/` | Yes | Home (blog list) |
| `/login` | No | Login |
| `/register` | No | Register |
| `/forgot-password` | No | Forgot password |
| `/reset-password/:token` | No | Reset password |
| `/verify-email/:token` | No | Verify email |
| `/blogs/:id` | No | Single blog |
| `/about` | No | About |
| `/trending` | Yes | Trending blogs |
| `/latest` | Yes | Latest blogs |
| `/createBlog` | Yes | Create blog |
| `/edit-blog/:id` | Yes | Edit blog |
| `/dashboard` | Yes | Dashboard (my blogs; admin: all blogs) |
| `/profile` | Yes | Profile |
| `/updateProfile` | Yes | Update profile |

### State (Redux)

- **auth:** user, token, login/register/logout
- **blog:** blogs list, loading, error; create/update/delete/fetch/like/comment/reply/emoji
- **user:** profile, follow/favourite state
- **theme:** darkMode

### API client (`utils/api.js`)

- Base URL: `http://localhost:5000/api`
- Request: adds `Authorization: Bearer <token>` from `localStorage.user`
- Response: normalizes `{ success, blog }` → `data` as blog object; on 401 tries refresh token and retries

### UI / UX

- **Tailwind CSS** for layout and styling  
- **Framer Motion** for page and list animations  
- **HeroScene** (React Three Fiber) on login/register  
- **Dark/Light** theme via `themeSlice` and ThemeToggle  
- **Category filter** on Home uses `VALID_BLOG_CATEGORIES` (same as backend)  
- **Create blog:** category select on main form; “Category cannot be changed later” note  
- **Edit blog:** category shown as read-only text  

---

## Features Summary

| Feature | Backend | Frontend |
|--------|---------|----------|
| Register / Login / Logout | JWT, refresh token | authSlice, Login/Register pages |
| Welcome email | Nodemailer (Gmail) | – |
| Forgot / Reset password | Token + email | ForgotPassword, ResetPassword pages |
| Email verification | Token in URL | VerifyEmail page |
| Create blog | Category, slug, excerpt, tags, SEO | CreateBlogPage, category dropdown |
| Edit blog | Author or admin; category only by admin | EditBlogPage, category read-only |
| Delete blog | Author only | Dashboard, SingleBlogPage |
| List blogs | getAll, trending, latest | Home, Trending, Latest |
| Single blog | Views, populate author/comments/replies | SingleBlogPage |
| Like / Unlike | Toggle in likes[] | SingleBlogPage |
| Comments & replies | Nested structure | SingleBlogPage |
| Emoji reactions on comments | Store per comment | SingleBlogPage |
| Categories | Enum; filter on list | Home filter + create dropdown |
| Search | – | Client-side by title/category on Home |
| Follow / Unfollow | userController | Profile, SingleBlogPage |
| Favourites | Toggle favourite blogs | userSlice, Profile/Dashboard |
| Profile / Update profile | userController | ProfilePage, UpdateProfilePage |
| Image upload | Cloudinary or local | Create/Edit blog, multer |
| AI writing assist | Groq API | AiWritingAssist component |
| Admin | isAdmin; edit any blog, change category | Dashboard “Manage All Blogs” tab |
| Dark mode | – | themeSlice, ThemeToggle |
| Responsive UI | – | Tailwind, mobile menu |

---

## Scripts Reference

**Root `package.json` (BlogSy2025/)**

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node backend/server` | Run backend only (production) |
| `server` | `nodemon backend/server` | Backend with auto-reload |
| `client` | `npm run dev --prefix frontend` | Frontend dev server |
| `dev` | `concurrently "npm run server" "npm run client"` | Backend + frontend |
| `data:import` | `node backend/seeder` | Seed users & blogs |
| `data:destroy` | `node backend/seeder -d` | Remove all seeded data |

**Frontend**

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

*Last updated for BlogSy 2025 codebase.*
