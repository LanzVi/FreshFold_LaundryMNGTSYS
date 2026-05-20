// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. Load environment variables from the .env file immediately
dotenv.config();

const app = express();

// 2. Configure CORS Middleware
app.use(cors({
    // Dynamically allow only the URL specified in your .env file
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    
    // Required if you plan to send HttpOnly cookies or authorization headers
    credentials: true,
    
    // Allowed methods for your Laundry Management CRUD endpoints
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    // Allowed headers standard for APIs using JWT
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json());

// Sample Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: "CORS configuration is working!" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});