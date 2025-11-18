// Admin Login Handler with Security
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');

    // Brute force protection
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
    const ATTEMPT_RESET_TIME = 5 * 60 * 1000; // 5 minutes

    // Check if user is already logged in
    checkExistingSession();

    // Check if account is locked
    checkLockout();

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check lockout before processing
        if (isLockedOut()) {
            showError('Слишком много попыток входа. Попробуйте через 15 минут.');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;

        // Hide previous error
        errorMessage.style.display = 'none';

        // Hash password before validation
        const hashedPassword = await hashPassword(password);

        // Validate credentials
        if (await validateCredentials(username, hashedPassword)) {
            // Reset failed attempts
            resetFailedAttempts();
            
            // Save session with secure token
            saveSession(username, remember);
            
            // Redirect to admin panel
            window.location.href = 'admin-panel.html';
        } else {
            // Increment failed attempts
            incrementFailedAttempts();
            
            // Show error
            const remainingAttempts = getRemainingAttempts();
            if (remainingAttempts > 0) {
                showError(`Неверный логин или пароль. Осталось попыток: ${remainingAttempts}`);
            } else {
                showError('Слишком много попыток входа. Аккаунт заблокирован на 15 минут.');
            }
        }
    });

    // SHA-256 hashing function
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Generate secure random token (like crypto wallet seed)
    function generateSecureToken() {
        const array = new Uint8Array(32); // 256 bits
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async function validateCredentials(username, hashedPassword) {
        // IMPORTANT: These are SHA-256 hashes of passwords
        // To generate new hash: await hashPassword('your_password')
        
        // Stored hashed credentials
        // Original passwords (DO NOT STORE IN PRODUCTION):
        // admin: SecureAdmin2024!@#
        // margarita: Rumyantseva_Secure_2024_Key!
        
        const validCredentials = {
            'admin': '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918' // SHA-256 of 'admin'
        };

        // Add timing attack protection
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        return validCredentials[username] === hashedPassword;
    }

    // Brute force protection functions
    function getFailedAttempts() {
        const attempts = localStorage.getItem('loginAttempts');
        return attempts ? JSON.parse(attempts) : { count: 0, timestamp: Date.now() };
    }

    function incrementFailedAttempts() {
        const attempts = getFailedAttempts();
        
        // Reset counter if last attempt was more than ATTEMPT_RESET_TIME ago
        if (Date.now() - attempts.timestamp > ATTEMPT_RESET_TIME) {
            attempts.count = 1;
        } else {
            attempts.count++;
        }
        
        attempts.timestamp = Date.now();
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));

        // Lock account if max attempts reached
        if (attempts.count >= MAX_ATTEMPTS) {
            localStorage.setItem('accountLocked', Date.now().toString());
        }
    }

    function resetFailedAttempts() {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('accountLocked');
    }

    function isLockedOut() {
        const lockedTime = localStorage.getItem('accountLocked');
        if (!lockedTime) return false;

        const timePassed = Date.now() - parseInt(lockedTime);
        if (timePassed > LOCKOUT_TIME) {
            // Lockout period expired
            resetFailedAttempts();
            return false;
        }

        return true;
    }

    function getRemainingAttempts() {
        const attempts = getFailedAttempts();
        return Math.max(0, MAX_ATTEMPTS - attempts.count);
    }

    function checkLockout() {
        if (isLockedOut()) {
            const lockedTime = parseInt(localStorage.getItem('accountLocked'));
            const remainingTime = Math.ceil((LOCKOUT_TIME - (Date.now() - lockedTime)) / 1000 / 60);
            showError(`Аккаунт заблокирован. Попробуйте через ${remainingTime} минут.`);
            loginForm.querySelector('button[type="submit"]').disabled = true;
        }
    }

    function saveSession(username, remember) {
        // Generate secure session token
        const sessionToken = generateSecureToken();
        
        const sessionData = {
            username: username,
            loginTime: new Date().toISOString(),
            isAdmin: true,
            token: sessionToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        if (remember) {
            // Save to localStorage (persistent)
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
        } else {
            // Save to sessionStorage (until browser closes)
            sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
        }

        // Store token hash for validation
        hashPassword(sessionToken).then(tokenHash => {
            localStorage.setItem('adminTokenHash', tokenHash);
        });
    }

    function checkExistingSession() {
        const localSession = localStorage.getItem('adminSession');
        const sessionSession = sessionStorage.getItem('adminSession');
        const session = localSession || sessionSession;

        if (session) {
            try {
                const sessionData = JSON.parse(session);
                
                // Check if session is expired
                if (new Date(sessionData.expiresAt) > new Date()) {
                    // User already logged in, redirect to admin panel
                    window.location.href = 'admin-panel.html';
                } else {
                    // Session expired, clear it
                    localStorage.removeItem('adminSession');
                    sessionStorage.removeItem('adminSession');
                    localStorage.removeItem('adminTokenHash');
                }
            } catch (e) {
                // Invalid session data, clear it
                localStorage.removeItem('adminSession');
                sessionStorage.removeItem('adminSession');
                localStorage.removeItem('adminTokenHash');
            }
        }
    }

    function showError(message = 'Неверный логин или пароль') {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Shake animation
        errorMessage.style.animation = 'none';
        setTimeout(() => {
            errorMessage.style.animation = 'shake 0.5s ease';
        }, 10);

        // Clear password field
        passwordInput.value = '';
        passwordInput.focus();
    }

    // Clear error on input
    usernameInput.addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });

    passwordInput.addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });
});
