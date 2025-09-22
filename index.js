// Initialize HTML structure
function initializeAppStructure() {
  // Create main HTML structure
  document.body.innerHTML = `
    <div id="offline-indicator" class="offline-indicator">
      📡 You're currently offline. Your changes will be saved locally.
    </div>
    
    <div id="online-indicator" class="online-indicator">
      🌐 Back online! Your data is synced.
    </div>
    
    <div id="pwa-install-banner" class="pwa-install-banner">
      <div class="pwa-banner-title">📱 Install Goals Tracker</div>
      <div class="pwa-banner-subtitle">Get the full app experience with offline access!</div>
      <button id="pwa-install-btn">📥 Install App</button>
      <button id="pwa-dismiss-btn">✕ Maybe Later</button>
    </div>
    
    <h1>🏆 Goals & Rewards Tracker</h1>

    <div id="instructions-modal" class="instructions">
      <span class="close" id="close-instructions">&times;</span>
      <h3 class="instructions-title">🎯 How to Use</h3>
      <p class="instructions-text">
        <strong>Click on any reward below</strong> → Select the goal you completed → Your progress updates instantly!
      </p>
    </div>
    
    <div class="actions">
    </div>

  `;
  
  // Set up event listeners for the dynamically created elements
  setupEventListeners();
}

function setupEventListeners() {

  // Reset data button
  const resetDataBtn = document.getElementById('reset-data-btn');
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', resetToDefaultsUI);
  }
  
  // Close instructions
  const closeInstructions = document.getElementById('close-instructions');
  if (closeInstructions) {
    closeInstructions.addEventListener('click', closeInstructionsModal);
  }

  // Modal click outside to close for goals
  window.addEventListener('click', function(event) {
    Goals.handleClickEvent(event);
    Rewards.handleClickEvent(event);
  });

  // Set up PWA event listeners (from pwa.js)
  setupPWAEventListeners();
}

// Function to initialize the app
function initializeApp() {
  try {
    // Initialize HTML structure and styles first
    initializeAppStructure();

    // Initialize PWA functionality
    initializePWA();

    // Initialize app data (either from localStorage or defaults)
    AppStorage.initialize();

    if (!AppStorage.shouldShowHelp()) {
      closeInstructionsModal();
    }



    // add and init target button
    Target.initialize();

    Rewards.initialize();

    // Load and display rewards
    Rewards.loadRewards();

    Goals.initialize();

    // add reset button last
    const buttonHTML = '<button id="reset-data-btn" class="action-btn secondary">🗑️ Reset All Data</button>';
    document.querySelector('.actions').insertAdjacentHTML('beforeend', buttonHTML);

    console.log('App initialized successfully');

  } catch (error) {
    console.error('Error initializing app:', error);
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Error loading app. Please check the console for details.';
    document.body.appendChild(errorDiv);
  }
}

function closeInstructionsModal() {
  const modal = document.getElementById('instructions-modal');
  if (modal) {
    modal.style.display = 'none';
    AppStorage.hideHelp();
  }
}


function showBriefMessage(message, color = '#4caf50') {
  const briefMsg = document.createElement('div');
  briefMsg.className = 'brief-message';
  briefMsg.style.background = color;
  briefMsg.textContent = message;

  document.body.appendChild(briefMsg);

  setTimeout(() => {
    briefMsg.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => briefMsg.remove(), 300);
  }, 2000);
}

// Helper function to refresh UI components after data changes
function refreshUI(options = {}) {
  const {
    refreshRewards = true,
    refreshGoalsModal = false
  } = options;

  if (refreshRewards) {
    Rewards.loadRewards();
  }

  if (refreshGoalsModal) {
    // Only refresh goals modal if it's currently open
    Goals.refresh();
    
    Rewards.refresh();
  }
}

// Utility functions for data management
function resetToDefaultsUI() {
  if (confirm('Reset to defaults? This will clear all your progress and start fresh with empty goals and rewards.')) {
    // Use storage.js function
    const success = AppStorage.resetToDefaults();
    if (success) {
      alert('Data reset! Starting fresh...');
      location.reload();
    } else {
      alert('Error resetting data. Please try again.');
    }
  }
}

// Load app when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Handle Enter key in goal editing
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        Goals.handleEnterEvent(event);
        Rewards.handleEnterEvent(event);
    }

    if (event.key === 'Escape') {
      Goals.handleEscEvent(event);
      Rewards.handleEscEvent(event);
    }
});



