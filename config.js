// API Configuration
// UPDATE THIS FILE AFTER DEPLOYING BACKEND

// Replace with your Vercel backend URL after deployment
const API_BASE_URL = 'https://your-backend-url.vercel.app';

// Or for local development:
// const API_BASE_URL = 'http://localhost:3001';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL };
}
