// Target management
function showSetTargetModal() {
  const currentTarget = AppStorage.getTarget();

  // Create modal backdrop
  const modalBackdrop = document.createElement('div');
  modalBackdrop.id = 'set-target-modal';
  modalBackdrop.className = 'modal-backdrop';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content-large';

  let modalHTML = `
    <div class="set-target-header">
      <div class="set-target-icon">🎯</div>
      <h2 class="set-target-title">Set Activity Target</h2>
      <div class="set-target-description">Choose how many activities are needed to earn each reward</div>
    </div>

    <div class="form-group">
      <label class="form-label">
        🏆 Activities needed per reward:
      </label>
      <input type="number" id="target-input" min="1" max="100" value="${currentTarget}"
             class="form-input" placeholder="Enter target (1-100)">
      <div class="target-info">
        Current target: <strong>${currentTarget} activities</strong>
      </div>
    </div>

    <div class="target-examples">
      <div class="target-examples-title">💡 Suggestions:</div>
      <div class="target-suggestion-buttons">
        <button onclick="setTargetValue(5)" class="target-suggestion-btn">5 - Quick rewards</button>
        <button onclick="setTargetValue(10)" class="target-suggestion-btn">10 - Balanced</button>
        <button onclick="setTargetValue(15)" class="target-suggestion-btn">15 - Challenging</button>
        <button onclick="setTargetValue(25)" class="target-suggestion-btn">25 - Long-term</button>
      </div>
    </div>

    <div class="button-group">
      <button onclick="confirmSetTarget()" class="primary-button">
        ✅ Update Target
      </button>
      <button onclick="closeSetTargetModal()" class="cancel-button">
        ❌ Cancel
      </button>
    </div>
  `;

  modalContent.innerHTML = modalHTML;
  modalBackdrop.appendChild(modalContent);
  document.body.appendChild(modalBackdrop);

  // Focus on input field
  setTimeout(() => {
    const input = document.getElementById('target-input');
    if (input) {
      input.focus();
      input.select();
    }
  }, 100);

  // Close modal when clicking backdrop
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeSetTargetModal();
    }
  });

  // Handle Enter key
  modalContent.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmSetTarget();
    }
  });
}

function setTargetValue(value) {
  const input = document.getElementById('target-input');
  if (input) {
    input.value = value;
    input.focus();
  }
}

function confirmSetTarget() {
  const targetInput = document.getElementById('target-input');
  const newTarget = parseInt(targetInput.value);

  if (!newTarget || newTarget < 1 || newTarget > 100) {
    showBriefMessage('⚠️ Please enter a valid target between 1 and 100', '#ff9800');
    targetInput.focus();
    return;
  }

  const success = AppStorage.updateTarget(newTarget);

  if (success) {
    // Close modal and refresh display
    closeSetTargetModal();

    // Update the button text to show new target
    updateTargetButton();

    // Refresh rewards display to show new progress calculations
    loadRewards();

    // Show success notification
    showTargetUpdatedNotification(newTarget);
  } else {
    showBriefMessage('❌ Error updating target. Please try again.', '#f44336');
  }
}

function closeSetTargetModal() {
  const modal = document.getElementById('set-target-modal');
  if (modal) {
    modal.remove();
  }
}

function showTargetUpdatedNotification(newTarget) {
  // Remove any existing notification
  const existingNotification = document.getElementById('target-updated-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.id = 'target-updated-notification';
  notification.className = 'undo-notification';

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-title">🎯 Target Updated</div>
      <div class="notification-subtitle">Now need ${newTarget} activities per reward</div>
    </div>
    <button onclick="hideTargetNotification()" 
            class="undo-button">
      ✓ Got it!
    </button>
  `;

  document.body.appendChild(notification);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideTargetNotification();
  }, 5000);
}

function hideTargetNotification() {
  const notification = document.getElementById('target-updated-notification');
  if (notification) {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }
}

function initialize() {
  // insert button in div class=actions
  const buttonHTML = '<button id="set-target-btn" class="action-btn">🎯 Set Target</button>';
  document.querySelector('.actions').insertAdjacentHTML('beforeend', buttonHTML);

  const setTargetBtn = document.getElementById('set-target-btn');
  if (setTargetBtn) {
    const currentTarget = AppStorage.getTarget();
    setTargetBtn.textContent = `🎯 Set Target (${currentTarget})`;
    setTargetBtn.addEventListener('click', showSetTargetModal);
  }
}

// Export functions to global scope for use by index.js
window.Target = {
    initialize
};

