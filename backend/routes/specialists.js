const express = require('express');
const router = express.Router();
const { prepare, saveDatabase } = require('../database');

// Get all specialists
router.get('/specialists', async (req, res) => {
    try {
        const specialists = await prepare('SELECT * FROM specialists ORDER BY id ASC').all();
        
        res.json({
            success: true,
            data: specialists
        });
    } catch (error) {
        console.error('Error reading specialists:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load specialists'
        });
    }
});

// Get single specialist
router.get('/specialists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const specialist = await prepare('SELECT * FROM specialists WHERE id = ?').get(id);
        
        if (!specialist) {
            return res.status(404).json({
                success: false,
                error: 'Specialist not found'
            });
        }
        
        res.json({
            success: true,
            data: specialist
        });
    } catch (error) {
        console.error('Error reading specialist:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load specialist'
        });
    }
});

// Update specialist
router.put('/specialists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (key !== 'id' && updates[key] !== undefined) {
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

        const query = `UPDATE specialists SET ${fields.join(', ')} WHERE id = ?`;
        await prepare(query).run(...values);
        saveDatabase();

        res.json({
            success: true,
            message: 'Specialist updated successfully'
        });
    } catch (error) {
        console.error('Error updating specialist:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update specialist'
        });
    }
});

// Create specialist
router.post('/specialists', async (req, res) => {
    try {
        const {
            name, photo, specialization, experience, price, status,
            description, education, additional_services
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const query = `
            INSERT INTO specialists (
                name, photo, specialization, experience, price, status,
                description, education, additional_services
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await prepare(query).run(
            name, photo || '', specialization || '', experience || 0,
            price || 0, status || 'available', description || '',
            education || '', additional_services || ''
        );

        saveDatabase();

        res.status(201).json({
            success: true,
            message: 'Specialist created successfully',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error creating specialist:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create specialist'
        });
    }
});

// Delete specialist
router.delete('/specialists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prepare('DELETE FROM specialists WHERE id = ?').run(id);
        saveDatabase();

        res.json({
            success: true,
            message: 'Specialist deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting specialist:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete specialist'
        });
    }
});

module.exports = router;
