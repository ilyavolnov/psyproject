const express = require('express');
const router = express.Router();
const { prepare } = require('../database');
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
        const stmt = prepare(`
            INSERT INTO requests (name, phone, email, request_type, message, specialist_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(name, phone, email, requestType, message, specialistId || null);

        // Get the created application
        const application = prepare('SELECT * FROM requests WHERE id = ?').get(result.lastInsertRowid);

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
router.get('/applications', async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM requests WHERE deleted = 0';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const applications = await prepare(query).all(...params);

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
router.get('/specialists', async (req, res) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM specialists';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY name';

        const specialists = await prepare(query).all(...params);

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
