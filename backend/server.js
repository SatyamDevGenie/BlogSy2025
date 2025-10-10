import dotenv from 'dotenv';
import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Config
dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ CORS Setup
const allowedOrigins = ['https://blogsy-2025.netlify.app', 'http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Handle Preflight
app.options('*', cors());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// API Check
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(chalk.yellowBright(`📡 Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`));
});






