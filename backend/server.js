// backend/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import streamRoutes from './routes/stream.js'; // if you have this

dotenv.config();

// 1️⃣ Initialize Express app
const app = express();

// 2️⃣ Connect to MongoDB
connectDB();

// 3️⃣ Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 4️⃣ Routes
app.use('/api/auth', authRoutes);
app.use('/api/stream', streamRoutes); // optional if you have stream token route

// 5️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
