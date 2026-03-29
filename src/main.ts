import { App } from './core/app';

declare global {
  interface Window {
    app?: App;
  }
}

async function main(): Promise<void> {
  const loading = document.getElementById('loading');
  
  try {
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    const container = document.getElementById('app');
    if (!container) {
      throw new Error('Container element with id "app" not found');
    }

    const app = new App('canvas-container');
    await app.initialize();
    window.app = app;
    console.log('Canvas Draw Ready!');

  } catch (error) {
    console.error('Failed to initialize Canvas Draw:', error);
    loading?.remove();
    
    const errorElement = document.createElement('div');
    errorElement.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #ff4444; color: white; padding: 20px; border-radius: 8px;
      font-family: Arial, sans-serif; font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 99999; max-width: 80%;
    `;
    errorElement.innerHTML = `
      <strong>Error initializing Canvas Draw</strong><br><br>
      ${error instanceof Error ? error.message : 'Unknown error'}<br><br>
      Please check the browser console (F12) for more details.<br><br>
      <button onclick="location.reload()" style="background: white; color: #ff4444; border: none;
        padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Refresh Page</button>
    `;
    document.body.appendChild(errorElement);
  }
}

main();