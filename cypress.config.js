const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // Disabling to prevent conflict with local environment variables
  allowCypressEnv: false,

  // Global Configuration
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false, // Turn off for better performance during local development
  screenshotOnRunFailure: true,
  chromeWebSecurity: false, // Helpful if your backend and frontend are on different ports

  e2e: {
    // Replace with your local dev server URL to avoid hardcoding in tests
    baseUrl: 'http://localhost:5173', 
    
    setupNodeEvents(on, config) {
      // FIX for Chrome Crash: Handle browser launch arguments
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Disable GPU and shared memory usage to prevent "unexpectedly closed" errors
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });

      // Implement other node event listeners here if needed
      return config;
    },
    
    // Pattern for your test files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});