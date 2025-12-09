const express = require('express');
const router = express.Router();
const { prepare } = require('../database');
const bcrypt = require('bcrypt');


// Change admin password
router.post('/admin/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const user_agent = req.headers['user-agent'];

        if (!currentPassword || !newPassword) {
            // Log failed attempt due to missing credentials
            await logAuthAttempt('admin', ip_address, user_agent, 'password_change', 'failure', 'missing current or new password');

            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            // Log failed attempt due to weak password
            await logAuthAttempt('admin', ip_address, user_agent, 'password_change', 'failure', 'new password too weak');

            return res.status(400).json({
                success: false,
                error: 'New password must be at least 8 characters long'
            });
        }

        // Check if password contains both letters and numbers (basic validation)
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
            // Log failed attempt due to weak password
            await logAuthAttempt('admin', ip_address, user_agent, 'password_change', 'failure', 'new password does not meet complexity requirements');

            return res.status(400).json({
                success: false,
                error: 'New password must contain both letters and numbers'
            });
        }

        // Get admin user from database
        const adminUser = await prepare('SELECT * FROM admin_user WHERE username = ?').get('admin');

        if (!adminUser) {
            // Log failed attempt due to admin user not found
            await logAuthAttempt('admin', ip_address, user_agent, 'password_change', 'failure', 'admin user not found');

            return res.status(404).json({
                success: false,
                error: 'Admin user not found'
            });
        }

        // Verify current password using bcrypt
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash);

        if (!isCurrentPasswordValid) {
            // Log failed attempt due to wrong current password
            await logAuthAttempt('admin', ip_address, user_agent, 'password_change', 'failure', 'invalid current password');

            return res.status(401).json({
                success: false,
                error: 'Invalid current password'
            });
        }

        // Hash new password with bcrypt
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Update password in database (no salt needed with bcrypt)
        await prepare(`
            UPDATE admin_user
            SET password_hash = ?, updated_at = datetime('now')
            WHERE username = ?
        `).run(newPasswordHash, 'admin');

        // Log successful password change
        await logAuthAttempt('admin', ip_address, user_agent, 'password_change', 'success', 'password changed successfully');

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const user_agent = req.headers['user-agent'];

        // Log technical error
        await logAuthAttempt('admin', ip_address, user_agent, 'password_change', 'failure', `technical error: ${error.message}`);

        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
});

// Verify admin credentials (for login)
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const user_agent = req.headers['user-agent'];

        if (!username || !password) {
            // Log failed attempt due to missing credentials
            await logAuthAttempt(username || 'unknown', ip_address, user_agent, 'login_attempt', 'failure', 'missing credentials');

            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Get admin user from database
        const adminUser = await prepare('SELECT * FROM admin_user WHERE username = ?').get(username);

        if (!adminUser) {
            // Log failed attempt due to unknown user
            await logAuthAttempt(username, ip_address, user_agent, 'login_attempt', 'failure', 'unknown user');

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);

        if (!isPasswordValid) {
            // Log failed attempt due to wrong password
            await logAuthAttempt(username, ip_address, user_agent, 'login_attempt', 'failure', 'wrong password');

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Log successful login
        await logAuthAttempt(username, ip_address, user_agent, 'login_success', 'success', 'successful login');

        res.json({
            success: true,
            message: 'Login successful'
        });

    } catch (error) {
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const user_agent = req.headers['user-agent'];

        // Log technical error
        await logAuthAttempt(req.body?.username || 'unknown', ip_address, user_agent, 'login_attempt', 'failure', `technical error: ${error.message}`);

        console.error('Error verifying admin credentials:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify credentials'
        });
    }
});

// Function to log authentication attempts
async function logAuthAttempt(username, ip_address, user_agent, action, result, details) {
    try {
        await prepare(`
            INSERT INTO auth_logs (username, ip_address, user_agent, action, result, details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(username, ip_address, user_agent, action, result, details);
    } catch (err) {
        console.error('Error logging auth attempt:', err);
        // Don't throw here as we don't want to interrupt the main flow
    }
}

// Endpoint for re-authentication for sensitive operations
router.post('/admin/re-authenticate', async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const user_agent = req.headers['user-agent'];

        if (!username || !password) {
            // Log failed re-auth attempt
            await logAuthAttempt(username || 'unknown', ip_address, user_agent, 're_auth_attempt', 'failure', 'missing credentials for re-authentication');

            return res.status(400).json({
                success: false,
                error: 'Username and password are required for re-authentication'
            });
        }

        // Get admin user from database
        const adminUser = await prepare('SELECT * FROM admin_user WHERE username = ?').get(username);

        if (!adminUser) {
            // Log failed re-auth attempt due to unknown user
            await logAuthAttempt(username, ip_address, user_agent, 're_auth_attempt', 'failure', 'unknown user for re-authentication');

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);

        if (!isPasswordValid) {
            // Log failed re-auth attempt due to wrong password
            await logAuthAttempt(username, ip_address, user_agent, 're_auth_attempt', 'failure', 'invalid password for re-authentication');

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Log successful re-authentication
        await logAuthAttempt(username, ip_address, user_agent, 're_auth_success', 'success', 'successful re-authentication for sensitive operation');

        res.json({
            success: true,
            message: 'Re-authentication successful'
        });

    } catch (error) {
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const user_agent = req.headers['user-agent'];

        // Log technical error
        await logAuthAttempt(req.body?.username || 'unknown', ip_address, user_agent, 're_auth_attempt', 'failure', `technical error: ${error.message}`);

        console.error('Error during re-authentication:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to re-authenticate'
        });
    }
});

module.exports = router;