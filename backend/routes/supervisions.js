const express = require('express');
const router = express.Router();
const { prepare, saveDatabase } = require('../database');

// Get all supervisions
router.get('/supervisions', async (req, res) => {
    try {
        const supervisions = await prepare('SELECT * FROM supervisions ORDER BY created_at DESC').all();
        
        // Parse JSON fields
        const parsedSupervisions = supervisions.map(supervision => ({
            ...supervision,
            tags: supervision.tags ? JSON.parse(supervision.tags) : [],
            description: supervision.description ? JSON.parse(supervision.description) : [],
            education: supervision.education ? JSON.parse(supervision.education) : []
        }));

        res.json({
            success: true,
            data: parsedSupervisions
        });
    } catch (error) {
        console.error('Error fetching supervisions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch supervisions'
        });
    }
});

// Get single supervision
router.get('/supervisions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supervision = await prepare('SELECT * FROM supervisions WHERE id = ?').get(id);
        
        if (!supervision) {
            return res.status(404).json({
                success: false,
                error: 'Supervision not found'
            });
        }

        // Parse JSON fields
        supervision.tags = supervision.tags ? JSON.parse(supervision.tags) : [];
        supervision.description = supervision.description ? JSON.parse(supervision.description) : [];
        supervision.education = supervision.education ? JSON.parse(supervision.education) : [];

        res.json({
            success: true,
            data: supervision
        });
    } catch (error) {
        console.error('Error fetching supervision:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch supervision'
        });
    }
});

// Create supervision
router.post('/supervisions', async (req, res) => {
    try {
        const {
            name, title, image, price, duration, experience,
            tags, description, education, status
        } = req.body;

        if (!name || !title) {
            return res.status(400).json({
                success: false,
                error: 'Name and title are required'
            });
        }

        const query = `
            INSERT INTO supervisions (
                name, title, image, price, duration, experience,
                tags, description, education, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await prepare(query).run(
            name, title, image || '', price || 0, duration || '',
            experience || '', 
            tags ? JSON.stringify(tags) : '[]',
            description ? JSON.stringify(description) : '[]',
            education ? JSON.stringify(education) : '[]',
            status || 'available'
        );

        saveDatabase();

        res.status(201).json({
            success: true,
            message: 'Supervision created successfully',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error creating supervision:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create supervision'
        });
    }
});

// Update supervision
router.put('/supervisions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (key === 'tags' || key === 'description' || key === 'education') {
                fields.push(`${key} = ?`);
                values.push(JSON.stringify(updates[key]));
            } else if (updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        fields.push('updated_at = datetime(\'now\')');
        values.push(id);

        const query = `UPDATE supervisions SET ${fields.join(', ')} WHERE id = ?`;
        await prepare(query).run(...values);
        saveDatabase();

        res.json({
            success: true,
            message: 'Supervision updated successfully'
        });
    } catch (error) {
        console.error('Error updating supervision:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update supervision'
        });
    }
});

// Delete supervision
router.delete('/supervisions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prepare('DELETE FROM supervisions WHERE id = ?').run(id);
        saveDatabase();

        res.json({
            success: true,
            message: 'Supervision deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting supervision:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete supervision'
        });
    }
});

module.exports = router;
