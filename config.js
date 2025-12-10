// API Configuration
const API_CONFIG = {
    getBaseURL: function() {
        // В продакшене используем относительные пути
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }
        return '/api';
    },

    // Универсальная функция для получения API URL
    getApiUrl: function(endpoint) {
        const baseUrl = this.getBaseURL();
        if (endpoint) {
            return baseUrl + '/' + endpoint.replace(/^\/+/, '');
        }
        return baseUrl;
    }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
