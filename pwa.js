// PWA (Progressive Web App) functionality
// This file handles service worker registration, install prompts, and offline/online status

let deferredPrompt;
let isOnline = navigator.onLine;

// PWA Initialization - call this from main app
function initializePWA() {
  registerServiceWorker();
  setupInstallPrompt();
  setupOnlineOfflineStatus();
  setupBackgroundSync();
}

// Register Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content is available; please refresh.');
                showUpdateAvailableNotification();
              }
            });
          });
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// PWA Install Banner and Prompt Handling
function setupInstallPrompt() {
  // PWA Install Banner
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt triggered');
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  // Handle app installation
  window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    hideInstallBanner();
  });
}

// Online/Offline Status Management
function setupOnlineOfflineStatus() {
  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Check initial status
  updateOnlineStatus();
}

function updateOnlineStatus() {
  const offlineIndicator = document.getElementById('offline-indicator');
  const onlineIndicator = document.getElementById('online-indicator');

  if (navigator.onLine) {
    if (!isOnline) {
      // Just came back online
      if (offlineIndicator) offlineIndicator.style.display = 'none';
      if (onlineIndicator) {
        onlineIndicator.style.display = 'block';
        setTimeout(() => {
          onlineIndicator.style.display = 'none';
        }, 3000);
      }
      isOnline = true;
      console.log('App is back online');
    }
  } else {
    if (isOnline) {
      // Just went offline
      if (onlineIndicator) onlineIndicator.style.display = 'none';
      if (offlineIndicator) offlineIndicator.style.display = 'block';
      isOnline = false;
      console.log('App is offline');
    }
  }
}

// Background Sync Setup
function setupBackgroundSync() {
  // Background sync for data when coming back online
  window.addEventListener('online', () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      }).catch(error => {
        console.log('Background sync registration failed:', error);
      });
    }
  });
}

// PWA Install Banner Functions
function showInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'block';
  }
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

// Update Available Notification
function showUpdateAvailableNotification() {
  if (confirm('A new version of the app is available. Would you like to refresh to get the latest features?')) {
    window.location.reload();
  }
}

// PWA Install Button Event Handlers
function setupPWAEventListeners() {
  const installBtn = document.getElementById('pwa-install-btn');
  const dismissBtn = document.getElementById('pwa-dismiss-btn');

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        hideInstallBanner();
      }
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      hideInstallBanner();
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    });
  }

  // Hide banner if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    hideInstallBanner();
  }
}

// Export functions for use in main app (if using modules)
// If not using modules, these functions are available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializePWA,
    setupPWAEventListeners,
    showInstallBanner,
    hideInstallBanner
  };
}

// Make functions available globally for non-module usage
window.initializePWA = initializePWA;
window.setupPWAEventListeners = setupPWAEventListeners;
window.showInstallBanner = showInstallBanner;
window.hideInstallBanner = hideInstallBanner;
