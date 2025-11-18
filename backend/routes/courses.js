const express = require('express');
const router = express.Router();
const { prepare, saveDatabase } = require('../database');

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
        
        // Parse JSON fields
        const parsedCourses = courses.map(course => ({
            ...course,
            topics: course.topics ? JSON.parse(course.topics) : [],
            has_certificate: Boolean(course.has_certificate)
        }));

        res.json({
            success: true,
            data: parsedCourses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses'
        });
    }
});

// Get single course
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prepare('SELECT * FROM courses WHERE id = ?').get(id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Parse JSON fields
        course.topics = course.topics ? JSON.parse(course.topics) : [];
        course.has_certificate = Boolean(course.has_certificate);

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course'
        });
    }
});

// Create course
router.post('/courses', async (req, res) => {
    try {
        const {
            title, subtitle, description, price, status, image,
            release_date, access_duration, feedback_duration,
            has_certificate, whatsapp_number, topics, bonuses,
            materials, author_name, author_description, page_blocks
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const query = `
            INSERT INTO courses (
                title, subtitle, description, price, status, image,
                release_date, access_duration, feedback_duration,
                has_certificate, whatsapp_number, topics, bonuses,
                materials, author_name, author_description, page_blocks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await prepare(query).run(
            title, subtitle, description, price || 0, status || 'available', image,
            release_date, access_duration, feedback_duration,
            has_certificate ? 1 : 0, whatsapp_number,
            topics ? JSON.stringify(topics) : '[]',
            bonuses, materials, author_name, author_description,
            page_blocks || '[]'
        );

        saveDatabase();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create course'
        });
    }
});

// Update course
router.put('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (key === 'topics' && updates[key]) {
                fields.push(`${key} = ?`);
                values.push(JSON.stringify(updates[key]));
            } else if (key === 'has_certificate') {
                fields.push(`${key} = ?`);
                values.push(updates[key] ? 1 : 0);
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

        const query = `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`;
        await prepare(query).run(...values);
        saveDatabase();

        res.json({
            success: true,
            message: 'Course updated successfully'
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update course'
        });
    }
});

// Delete course
router.delete('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prepare('DELETE FROM courses WHERE id = ?').run(id);
        saveDatabase();

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete course'
        });
    }
});

module.exports = router;
