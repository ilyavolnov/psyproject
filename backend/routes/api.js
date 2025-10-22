const express = require('express');
const router = express.Router();
const db = require('../database');
const { notifyNewApplication } = require('../bot');

// Submit application
router.post('/applications', (req, res) => {
    try {
        const { name, phone, email, requestType, message, specialistId } = req.body;

        // Validation
        if (!name || !phone || !requestType) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'phone', 'requestType']
            });
        }

        // Insert into database
        const stmt = db.prepare(`
            INSERT INTO applications (name, phone, email, request_type, message, specialist_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(name, phone, email, requestType, message, specialistId || null);

        // Get the created application
        const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid);

        // Send Telegram notification
        notifyNewApplication(application);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            error: 'Failed to submit application',
            message: error.message
        });
    }
});

// Get all applications (for admin)
router.get('/applications', (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM applications';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const stmt = db.prepare(query);
        const applications = stmt.all(...params);

        res.json({
            success: true,
            data: applications,
            count: applications.length
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            error: 'Failed to fetch applications',
            message: error.message
        });
    }
});

// Get specialists
router.get('/specialists', (req, res) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM specialists';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY name';

        const stmt = db.prepare(query);
        const specialists = stmt.all(...params);

        res.json({
            success: true,
            data: specialists
        });

    } catch (error) {
        console.error('Error fetching specialists:', error);
        res.status(500).json({
            error: 'Failed to fetch specialists',
            message: error.message
        });
    }
});

module.exports = router;
