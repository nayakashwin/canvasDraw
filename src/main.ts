/**
 * ============================================================================
 * MAIN ENTRY POINT
 * ============================================================================
 * 
 * PURPOSE:
 * This is the entry point for the application. It:
 * - Creates App instance
 * - Initializes the application
 * - Exposes app globally for debugging
 * 
 * WHY THIS FILE EXISTS:
 * Every application needs a starting point. This file is the first
 * code that runs when the application loads. It sets up everything
 * and starts the application.
 * 
 * HOW IT WORKS:
 * 1. Import App class
 * 2. Wait for DOM to be ready
 * 3. Create App instance
 * 4. Initialize the app
 * 
 * BEGINNER TIP:
 * Think of this as the "start button" for the application.
 * When this file runs, the application comes to life.
 */

import { App } from './core/app';

/**
 * Application instance
 * 
 * We store this globally so we can access it from the browser console
 * for debugging purposes.
 * 
 * BEGINNER TIP:
 * In the browser console, you can type:
 * window.app.createObject(...)
 * window.app.zoomIn()
 * etc.
 * 
 * This is very useful for testing and debugging.
 */
declare global {
  interface Window {
    app?: App;
  }
}

/**
 * Main function to initialize the application
 * 
 * This function is called when the DOM is ready.
 * It creates and initializes the application.
 * 
 * BEGINNER TIP:
 * We wrap initialization in a function to keep things organized.
 * The function is called at the bottom of this file.
 */
async function main(): Promise<void> {
  const loading = document.getElementById('loading');
  
  try {
    /**
     * Step 1: Wait for DOM to be ready
     * 
     * The DOM (Document Object Model) is the HTML structure.
     * We need it to be ready before we can access elements.
     * 
     * BEGINNER TIP:
     * The DOM is like a tree representation of your HTML.
     * document.getElementById() searches this tree for elements.
     */
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    /**
     * Step 2: Check if container exists
     * 
     * The container is the div where the canvas will be rendered.
     * If it doesn't exist, we show an error.
     * 
     * BEGINNER TIP:
     * The container should be defined in index.html:
     * <div id="app"></div>
     */
    const container = document.getElementById('app');
    if (!container) {
      throw new Error(
        'Container element with id "app" not found. ' +
        'Please make sure your HTML has <div id="app"></div>'
      );
    }

    /**
     * Step 3: Create App instance
     * 
     * The App constructor takes the canvas container ID.
     * This tells the app where to render the canvas.
     * 
     * BEGINNER TIP:
     * The App class is the main coordinator of the application.
     * It manages all the other components (canvas, objects, etc.).
     */
    console.log('Creating Canvas Draw application...');
    const app = new App('canvas-container');

    /**
     * Step 4: Initialize the application
     * 
     * This sets up all the managers and event listeners.
     * It's an async operation because it initializes IndexedDB.
     * 
     * BEGINNER TIP:
     * Async operations take time to complete.
     * We use 'await' to wait for them to finish.
     */
    await app.initialize();

    /**
     * Step 5: Expose app globally for debugging
     * 
     * This allows you to access the app from the browser console.
     * 
     * EXAMPLE:
     * In the browser console, type:
     * window.app.zoomIn()
     * window.app.createObject(...)
     * 
     * BEGINNER TIP:
     * This is very useful for testing and debugging.
     * You can call any App method from the console.
     */
    window.app = app;

    console.log('Canvas Draw Ready!');

  } catch (error) {
    /**
     * Handle initialization errors
     * 
     * If anything goes wrong during initialization, we catch the error
     * and display a user-friendly message.
     * 
     * BEGINNER TIP:
     * Always handle errors in production code.
     * This prevents the application from silently failing.
     */
    console.error('Failed to initialize Canvas Draw:', error);
    
    // Always remove loading screen
    if (loading) {
      loading.remove();
    }
    
    /**
     * Display error message to user
     * 
     * We create a temporary error element to show the user.
     */
    const errorElement = document.createElement('div');
    errorElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 99999;
      max-width: 80%;
    `;
    errorElement.innerHTML = `
      <strong>Error initializing Canvas Draw</strong><br><br>
      ${error instanceof Error ? error.message : 'Unknown error'}<br><br>
      Please check the browser console (F12) for more details.<br><br>
      <button onclick="location.reload()" style="
        background: white;
        color: #ff4444;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      ">Refresh Page</button>
    `;
    document.body.appendChild(errorElement);
  }
}

/**
 * Call main function to start the application
 * 
 * We call main() immediately to start the application.
 * 
 * BEGINNER TIP:
 * This is the "start button" for the application.
 * When this line runs, everything else starts happening.
 */
main();