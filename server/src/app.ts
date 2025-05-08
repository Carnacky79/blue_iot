// server/src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import { config } from 'dotenv';
import mongoose from 'mongoose';

// Carica le variabili d'ambiente dal file .env
config();

// Import routes
import authRoutes from './routes/auth';
import siteRoutes from './routes/site';
import mapRoutes from './routes/map';
import antennaRoutes from './routes/antenna';
import tagRoutes from './routes/tag';
import userRoutes from './routes/user';

// Crea l'app Express
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/antennas', antennaRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);

// Middleware gestione errori
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to MongoDB if MONGODB_URI is provided
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.log('MongoDB URI not provided, using in-memory storage');
    // Qui potremmo inizializzare un database in-memory se necessario
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
