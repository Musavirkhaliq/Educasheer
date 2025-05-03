import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Register service worker for better performance and offline capabilities
if ('serviceWorker' in navigator) {
  // Create a global function to clear cache
  window.clearCache = async () => {
    if (!navigator.serviceWorker.controller) {
      console.log('No active service worker found');
      return false;
    }

    console.log('Sending clear cache message to service worker');

    // Create a promise that resolves when the service worker responds
    const clearPromise = new Promise((resolve) => {
      // Set up a one-time message handler
      const messageHandler = (event) => {
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          console.log('Cache cleared confirmation received');
          navigator.serviceWorker.removeEventListener('message', messageHandler);
          resolve(true);
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);

      // Set a timeout in case the service worker doesn't respond
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        console.log('Cache clear request timed out');
        resolve(false);
      }, 3000);
    });

    // Send the clear cache message
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });

    // Wait for the response or timeout
    const result = await clearPromise;

    // Force a page reload to ensure fresh content
    if (result) {
      console.log('Reloading page to ensure fresh content');
      window.location.reload(true);
    }

    return result;
  };

  // Listen for cache update messages from the service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('Cache updated notification received, timestamp:', event.data.timestamp);
      // You could show a notification to the user here
    }
  });

  // Register the service worker
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js?v=' + new Date().getTime())
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);

        // Check for updates every 30 minutes
        setInterval(() => {
          registration.update()
            .then(() => console.log('Service worker update check completed'));
        }, 30 * 60 * 1000);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")).render(<App />);
