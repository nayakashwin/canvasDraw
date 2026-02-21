/**
 * ============================================================================
 * EXPRESS SERVER
 * ============================================================================
 * 
 * PURPOSE:
 * This is a simple Express server that serves the application.
 * It provides:
 * - Static file serving for the public folder
 * - Development server for testing
 * - Production server for deployment
 * 
 * WHY WE NEED IT:
 * While webpack-dev-server is great for development, sometimes we want
 * a simple Express server for production or alternative development.
 * 
 * HOW TO USE:
 * npm start    - Start this Express server
 * npm run dev  - Use webpack-dev-server instead (recommended for development)
 * 
 * BEGINNER TIP:
 * This server is simple and serves static files from the public folder.
 * For development, use webpack-dev-server (npm run dev) instead.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create Express app
 * 
 * Express is a web framework for Node.js.
 * It makes it easy to create web servers and APIs.
 * 
 * BEGINNER TIP:
 * Think of Express as a tool that handles HTTP requests.
 * When you visit a URL, Express decides what to send back.
 */
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware: Parse JSON bodies
 * 
 * This allows the server to understand JSON data in requests.
 * 
 * BEGINNER TIP:
 * Middleware is like a processing pipeline.
 * Requests pass through middleware before reaching the final handler.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Serve static files from public directory
 * 
 * This serves HTML, CSS, JS, and other static files.
 * 
 * BEGINNER TIP:
 * Static files are files that don't change dynamically.
 * They include HTML, CSS, JavaScript, images, etc.
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Serve production build if available
 * 
 * If a production build exists (dist/bundle.js), serve it.
 * Otherwise, let webpack-dev-server handle it during development.
 * 
 * BEGINNER TIP:
 * This allows the same server to work in both
 * development and production modes.
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Health check endpoint
 * 
 * This endpoint can be used to check if the server is running.
 * 
 * BEGINNER TIP:
 * Health checks are useful for monitoring and deployment.
 * They tell you if the server is alive and working.
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Canvas Draw server is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Start server
 * 
 * This starts listening for HTTP requests on the specified port.
 * 
 * BEGINNER TIP:
 * The server listens for incoming requests and responds to them.
 * It's like a receptionist that answers the phone.
 */
app.listen(PORT, () => {
  console.log('================================================================');
  console.log('  Canvas Draw - Express Server');
  console.log('================================================================');
  console.log('');
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('================================================================');
  console.log('');
  console.log('Note: For development with hot reload, use:');
  console.log('  npm run dev');
  console.log('');
  console.log('This Express server is for production or simple testing.');
  console.log('================================================================');
});

/**
 * Graceful shutdown
 * 
 * This handles server shutdown gracefully when Ctrl+C is pressed.
 * 
 * BEGINNER TIP:
 * Graceful shutdown ensures all connections are properly closed.
 * It prevents data loss and errors during shutdown.
 */
process.on('SIGINT', () => {
  console.log('');
  console.log('================================================================');
  console.log('  Shutting down gracefully...');
  console.log('================================================================');
  process.exit(0);
});

/**
 * Error handling
 * 
 * This catches unhandled errors to prevent server crashes.
 * 
 * BEGINNER TIP:
 * Always handle errors in production code.
 * This prevents the server from crashing unexpectedly.
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});