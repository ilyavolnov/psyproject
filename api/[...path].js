// Vercel Serverless Function - Catch-all API routes
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('../backend/database');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database once
let initialized = false;
async function ensureInitialized() {
    if (!initialized) {
        try {
            await initDatabase();
            initialized = true;
            console.log('✅ Database initialized');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }
}

// Load routes
const apiRoutes = require('../backend/routes/api');
const requestsRoutes = require('../backend/routes/requests');
const settingsRoutes = require('../backend/routes/settings');
const specialistsRoutes = require('../backend/routes/specialists');
const coursesRoutes = require('../backend/routes/courses');
const supervisionsRoutes = require('../backend/routes/supervisions');
const promoCodesRoutes = require('../backend/routes/promo-codes');
const uploadRoutes = require('../backend/routes/upload');

// Mount routes
app.use('/api', apiRoutes);
app.use('/api', requestsRoutes);
app.use('/api', settingsRoutes);
app.use('/api', specialistsRoutes);
app.use('/api', coursesRoutes);
app.use('/api', supervisionsRoutes);
app.use('/api', promoCodesRoutes);
app.use('/api', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: 'vercel'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Export handler for Vercel
module.exports = async (req, res) => {
    try {
        await ensureInitialized();
        return app(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ 
            error: 'Server initialization failed',
            message: error.message 
        });
    }
};
