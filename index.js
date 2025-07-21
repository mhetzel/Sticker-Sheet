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
    
    <div class="instructions">
      <h3 class="instructions-title">🎯 How to Use</h3>
      <p class="instructions-text">
        <strong>Click on any reward below</strong> → Select the goal you completed → Your progress updates instantly!
      </p>
    </div>
    
    <div class="actions">
      <button id="manage-goals-btn" class="action-btn">⚙️ Manage Goals</button>
      <button id="manage-rewards-btn" class="action-btn">🏆 Manage Rewards</button>
      <button id="set-target-btn" class="action-btn">🎯 Set Target</button>
      <button id="reset-data-btn" class="action-btn secondary">🗑️ Reset All Data</button>
    </div>

    <div id="manage-goals-modal" class="modal">
      <div class="modal-content">
        <span class="close" id="close-manage-goals">&times;</span>
        <h2>Manage Goals</h2>
        <div class="goals-list">
          <h3>Current Goals</h3>
          <div id="current-goals-list"></div>
        </div>
        <div class="add-goal-section">
          <h3>Add New Goal</h3>
          <input type="text" id="new-goal-input" placeholder="Enter new goal (e.g., '15 squats')" />
          <button id="add-new-goal-btn">Add Goal</button>
        </div>
      </div>
    </div>

    <div id="manage-rewards-modal" class="modal">
      <div class="modal-content">
        <span class="close" id="close-manage-rewards">&times;</span>
        <h2>Manage Rewards</h2>
        <div class="rewards-list">
          <h3>Current Rewards</h3>
          <div id="current-rewards-list"></div>
        </div>
        <div class="add-reward-section">
          <h3>Add New Reward</h3>
          <input type="text" id="new-reward-input-modal" placeholder="Enter new reward (e.g., 'Movie Night')" />
          <button id="add-new-reward-btn">Add Reward</button>
        </div>
      </div>
    </div>
        

  `;
  
  // Set up event listeners for the dynamically created elements
  setupEventListeners();
}

function setupEventListeners() {
  // Set target button
  const setTargetBtn = document.getElementById('set-target-btn');
  if (setTargetBtn) {
    setTargetBtn.addEventListener('click', showSetTargetModal);
  }

  // Reset data button
  const resetDataBtn = document.getElementById('reset-data-btn');
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', resetToDefaultsUI);
  }


  // Manage goals button
  const manageGoalsBtn = document.getElementById('manage-goals-btn');
  if (manageGoalsBtn) {
    manageGoalsBtn.addEventListener('click', showManageGoalsModal);
  }

  // Close manage goals modal
  const closeManageGoals = document.getElementById('close-manage-goals');
  if (closeManageGoals) {
    closeManageGoals.addEventListener('click', closeManageGoalsModal);
  }

  // Add new goal button
  const addNewGoalBtn = document.getElementById('add-new-goal-btn');
  if (addNewGoalBtn) {
    addNewGoalBtn.addEventListener('click', addNewGoal);
  }

  // Manage rewards button
  const manageRewardsBtn = document.getElementById('manage-rewards-btn');
  if (manageRewardsBtn) {
    manageRewardsBtn.addEventListener('click', showManageRewardsModal);
  }

  // Close manage rewards modal
  const closeManageRewards = document.getElementById('close-manage-rewards');
  if (closeManageRewards) {
    closeManageRewards.addEventListener('click', closeManageRewardsModal);
  }

  // Add new reward button in modal
  const addNewRewardBtn = document.getElementById('add-new-reward-btn');
  if (addNewRewardBtn) {
    addNewRewardBtn.addEventListener('click', addNewRewardFromModal);
  }

  // Modal click outside to close for goals
  window.addEventListener('click', function(event) {
    const manageGoalsModal = document.getElementById('manage-goals-modal');
    if (event.target === manageGoalsModal) {
      closeManageGoalsModal();
    }
    const manageRewardsModal = document.getElementById('manage-rewards-modal');
    if (event.target === manageRewardsModal) {
      closeManageRewardsModal();
    }
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
    initializeAppData();

    // Load and display earned rewards
    loadEarnedRewards();

    // Update target button text
    updateTargetButton();

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



// Add activity to reward
function showGoalSelectionModal(selectedReward) {
  try {
    // Get current data from localStorage
    const data = AppStorage.getStoredData();
    if (!data) {
      throw new Error('No app data found');
    }

    const goals = data.goals || [];
    const rewards = data.rewards || [];
    const target = data.target || 0;
    const currentReward = rewards[selectedReward];
    const currentRewardName = currentReward.rewardName;
    const currentProgress = currentReward && currentReward.activity ? currentReward.activity.length : 0;

    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'goal-selection-modal';
    modalBackdrop.className = 'modal-backdrop';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-large';

    // Determine if reward is earned
    const isEarned = currentProgress >= target;
    const statusIcon = isEarned ? '🏆' : '⏳';
    const statusText = isEarned ? 'EARNED!' : `${currentProgress}/${target} (${target - currentProgress} more needed)`;
    const statusColor = isEarned ? '#4caf50' : '#ff9800';

    let modalHTML = `
      <div class="goal-modal-header">
        <div class="goal-modal-icon">${statusIcon}</div>
        <h2 class="goal-modal-title ${isEarned ? 'earned' : 'progress'}">${currentRewardName}</h2>
        <div class="goal-modal-status">${statusText}</div>
        <div class="goal-modal-instruction">Select a completed goal to add to this reward:</div>
      </div>

      <div class="goal-buttons-container">
        <div class="goal-buttons-grid">
    `;

    // Add goal buttons
    goals.forEach(goal => {
      modalHTML += `
        <button onclick="confirmGoalForReward(${selectedReward},'${currentRewardName}', '${goal}')" 
                class="goal-button">
          🎯 ${goal}
        </button>
      `;
    });

    modalHTML += `
        </div>
      </div>

      <div class="modal-actions">
        <button onclick="closeGoalModal()" class="cancel-button">
          ❌ Cancel
        </button>
      </div>
    `;

    modalContent.innerHTML = modalHTML;
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);

    // Close modal when clicking backdrop
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeGoalModal();
      }
    });

  } catch (error) {
    console.error('Error showing goal selection:', error);
    alert('Error loading goals. Please try again.');
  }
}

function confirmGoalForReward(rewardIndex, rewardName, completedGoal) {
  // Create activity entry with current date
  const activityEntry = `${completedGoal} completed on ${new Date().toISOString().split('T')[0]}`;

  // Add activity directly to the main app data
  const success = AppStorage.addActivityToReward(rewardIndex, activityEntry);

  if (success) {
    // Show subtle notification with undo option
    showUndoNotification(rewardName, completedGoal, activityEntry);

    // Close modal and refresh displays
    closeGoalModal();

    // Refresh rewards display immediately
    loadEarnedRewards();
  } else {
    alert('Error adding activity to reward. Please try again.');
  }
}

function closeGoalModal() {
  const modal = document.getElementById('goal-selection-modal');
  if (modal) {
    modal.remove();
  }
}

// Show activity history for a reward
function showActivityHistory(rewardIndex) {
  try {
    const data = AppStorage.getStoredData();
    if (!data || !data.rewards[rewardIndex]) {
      alert('No data found for this reward.');
      return;
    }

    const reward = data.rewards[rewardIndex];
    const activities = reward.activity || [];
    const target = data.target || 0;
    const isEarned = activities.length >= target;

    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'activity-history-modal';
    modalBackdrop.className = 'modal-backdrop';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-xlarge';

    const statusIcon = isEarned ? '🏆' : '📋';
    const statusText = isEarned ? 'EARNED REWARD' : 'IN PROGRESS';
    const statusColor = isEarned ? '#4caf50' : '#333';

    let modalHTML = `
      <div class="activity-history-header">
        <div class="activity-history-icon">${statusIcon}</div>
        <h2 class="activity-history-title ${isEarned ? 'earned' : 'progress'}">${rewardIndex}</h2>
        <div class="activity-history-status">${statusText}</div>
        <div class="activity-history-count">Activity History (${activities.length} activities)</div>
      </div>
    `;

    if (activities.length === 0) {
      modalHTML += `
        <div class="no-activities-message">
          No activities completed yet for this reward.
        </div>
      `;
    } else {
      modalHTML += `
        <div class="activity-list">
      `;

      activities.forEach((activity, index) => {
        modalHTML += `
          <div class="activity-item ${index % 2 === 0 ? 'even' : 'odd'} ${isEarned ? 'earned' : 'progress'}">
            <div class="activity-content">
              <div class="activity-goal">
                ${activity.split(' completed on ')[0] || activity}
              </div>
              <div class="activity-date">
                ${activity.includes(' completed on ') ? 
                  'Completed on ' + activity.split(' completed on ')[1] : 
                  'Activity recorded'}
              </div>
            </div>
            <div class="activity-actions">
              <button onclick="deleteActivity(${rewardIndex}, ${index})" 
                      class="delete-activity-button"
                      title="Delete this activity">
                🗑️ Delete
              </button>
              <div class="activity-number ${isEarned ? 'earned' : 'progress'}">
                ${index + 1}
              </div>
            </div>
          </div>
        `;
      });

      modalHTML += '</div>';
    }

    // Only show "Add Activity" button for rewards that haven't been earned yet
    modalHTML += `
      <div class="modal-actions">
        ${!isEarned ? `
          <button onclick="showGoalSelectionModal(${rewardIndex}); closeActivityHistoryModal();" 
                  class="secondary-button">
            📝 Add Activity to This Reward
          </button>
        ` : ''}
        <button onclick="closeActivityHistoryModal()" 
                class="modal-close-button">
          ✕ Close
        </button>
      </div>
    `;

    modalContent.innerHTML = modalHTML;
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);

    // Close modal when clicking backdrop
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeActivityHistoryModal();
      }
    });

  } catch (error) {
    console.error('Error showing activity history:', error);
    alert('Error loading activity history. Please try again.');
  }
}

function closeActivityHistoryModal() {
  const modal = document.getElementById('activity-history-modal');
  if (modal) {
    modal.remove();
  }
}


// Function to load and display earned rewards
function loadEarnedRewards() {
  try {
    // Get data from localStorage
    const data = AppStorage.getStoredData();
    if (!data) {
      console.error('No app data found in localStorage');
      return;
    }

    const rewards = data.rewards || {};
    const target = data.target || 0;

    // Calculate which rewards should be earned based on activity count vs target
    const earnedRewards = [];
    const progressRewards = [];

    Object.keys(rewards).forEach(index => {
      const reward = rewards[index];
      const activityCount = reward.activity ? reward.activity.length : 0;

      if (activityCount >= target) {
        earnedRewards.push({
          name: reward.rewardName,
          index: index,
          activityCount: activityCount,
          isEarned: true
        });
      } else {
        progressRewards.push({
          name: reward.rewardName,
          index: index,
          activityCount: activityCount,
          progress: (activityCount / target * 100).toFixed(1),
          remaining: target - activityCount,
          isEarned: false
        });
      }
    });

    createRewardsWindow(earnedRewards, progressRewards, target);

  } catch (error) {
    console.error('Error loading rewards:', error);
  }
}

function createRewardsWindow(earnedRewards, progressRewards, target) {
  // Remove existing rewards window if any
  const existingWindow = document.getElementById('rewards-window');
  if (existingWindow) {
    existingWindow.remove();
  }

  // Create rewards window
  const rewardsDiv = document.createElement('div');
  rewardsDiv.id = 'rewards-window';
  rewardsDiv.className = 'rewards-window';

  let rewardsHTML = `
    <div class="rewards-header">
      <div class="rewards-title">
        🏆 Rewards System
      </div>
      <div class="rewards-target">
        Target: ${target} activities
      </div>
    </div>
  `;

  // Show earned rewards section
  if (earnedRewards.length > 0) {
    rewardsHTML += `
      <div class="rewards-section">
        <h3 class="rewards-section-title">✨ Earned Rewards (${earnedRewards.length})</h3>
        <div class="rewards-grid">
    `;

    earnedRewards.forEach(reward => {
      rewardsHTML += `
        <div class="earned-reward-card" onclick="showActivityHistory('${reward.index}')">
          <div class="reward-icon">🏆</div>
          <div class="reward-name">
            ${reward.name}
          </div>
          <div class="reward-status">
            ✅ ${reward.activityCount}/${target} Complete!
          </div>
          <div class="reward-hint">
            Click to view activity history
          </div>
          <div class="reward-history-icon">📋</div>
          <button onclick="deleteReward('${reward.name}'); event.stopPropagation();" 
                  class="delete-reward-button"
                  title="Delete this reward">
            🗑️
          </button>
        </div>
      `;
    });

    rewardsHTML += '</div></div>';
  }

  // Show progress rewards section
  if (progressRewards.length > 0) {
    rewardsHTML += `
      <div class="rewards-section">
        <h3 class="rewards-section-title">🎯 Rewards in Progress (${progressRewards.length})</h3>
        <div class="rewards-grid-progress">
    `;

    progressRewards.forEach(reward => {
      const progressBarWidth = (reward.activityCount / target) * 100;

      rewardsHTML += `
        <div class="progress-reward-card" onclick="showGoalSelectionModal('${reward.index}')">
          <div class="progress-reward-header">
            <div class="progress-reward-icon">⏳</div>
            <div class="progress-reward-name">
              ${reward.name}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressBarWidth}%;"></div>
          </div>

          <div class="progress-info">
            <div>${reward.activityCount}/${target} activities (${reward.progress}%)</div>
            <div class="progress-remaining">
              ${reward.remaining} more needed
            </div>
            <div class="progress-action-hint">
              Click to add activity
            </div>
          </div>
          ${reward.activityCount > 0 ? `
            <button onclick="showActivityHistory('${reward.index}'); event.stopPropagation();" 
                    class="progress-history-button">📋</button>
          ` : ''}
        </div>
      `;
    });

    rewardsHTML += '</div></div>';
  }

  // If no rewards at all
  if (earnedRewards.length === 0 && progressRewards.length === 0) {
    rewardsHTML += `
      <div class="no-rewards-message">
        💫 No rewards configured. Add activities to your rewards to get started!
      </div>
    `;
  }

  // Add refresh button and data management
  rewardsHTML += `
    <div class="rewards-actions">
      <div>
        <button onclick="loadEarnedRewards()" class="refresh-button">
          🔄 Refresh Display
        </button>
      </div>
    </div>
  `;

  rewardsDiv.innerHTML = rewardsHTML;
  // Insert after the instructions section
  const instructions = document.querySelector('.instructions');
  if (instructions) {
    instructions.parentNode.insertBefore(rewardsDiv, instructions.nextSibling);
  } else {
    document.body.appendChild(rewardsDiv);
  }
}


// Target management
function showSetTargetModal() {
  const currentTarget = AppStorage.getAppConfig().target;

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
    loadEarnedRewards();

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

function updateTargetButton() {
  const setTargetBtn = document.getElementById('set-target-btn');
  if (setTargetBtn) {
    const currentTarget = AppStorage.getAppConfig().target;
    setTargetBtn.textContent = `🎯 Set Target (${currentTarget})`;
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


// Rewards management
// Manage Rewards Modal Functions
function showManageRewardsModal() {
  const modal = document.getElementById('manage-rewards-modal');
  if (modal) {
    modal.style.display = 'block';
    populateCurrentRewards();
  }
}

function closeManageRewardsModal() {
  const modal = document.getElementById('manage-rewards-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function populateCurrentRewards() {
  const rewardsList = document.getElementById('current-rewards-list');
  const data = AppStorage.getStoredData();
  if (!rewardsList || !data.rewards) return;

  rewardsList.innerHTML = '';

  data.rewards.forEach((reward, index) => {
    const rewardName = reward.rewardName;
    rewardsList.innerHTML += `
      <div class="reward-item">
        <span class="reward-text" id="reward-text-${index}">${rewardName}</span>
        <input type="text" class="reward-edit-input" id="reward-edit-${index}" value="${rewardName}" style="display: none;">
        <div class="reward-actions">
          <button class="edit-reward-btn" onclick="editReward(${index})" id="edit-reward-btn-${index}">Edit</button>
          <button class="save-reward-btn" onclick="saveReward(${index})" id="save-reward-btn-${index}" style="display: none;">Save</button>
          <button class="cancel-reward-btn" onclick="cancelEditReward(${index})" id="cancel-reward-btn-${index}" style="display: none;">Cancel</button>
          <button class="delete-reward-btn" onclick="deleteRewardFromModal(${index}, '${rewardName}')">Delete</button>
        </div>
      </div>
    `;
  });
}

function addNewRewardFromModal() {
  const input = document.getElementById('new-reward-input-modal');
  const newReward = input.value.trim();
  if (!newReward) {
    showBriefMessage('⚠️ Please enter a reward name', '#ff9800');
    input.focus();
    return;
  }
  const success = AppStorage.addReward(newReward);
  if (success) {
    input.value = '';
    populateCurrentRewards();
    showRewardAddedNotification(newReward);
  } else {
    showBriefMessage('❌ Error adding reward. This reward may already exist.', '#f44336');
  }
}

function deleteRewardFromModal(rewardIndex, rewardName) {
  if (confirm(`Are you sure you want to delete the reward "${rewardName}"?`)) {
    const success = AppStorage.deleteReward(rewardIndex);
    if (success) {
      populateCurrentRewards();
      loadEarnedRewards();
      showBriefMessage('🗑️ Reward deleted', '#ff9800');
    } else {
      showBriefMessage('❌ Error deleting reward', '#f44336');
    }
  }
}

function editReward(index) {
  const rewardText = document.getElementById(`reward-text-${index}`);
  const rewardInput = document.getElementById(`reward-edit-${index}`);
  const editBtn = document.getElementById(`edit-reward-btn-${index}`);
  const saveBtn = document.getElementById(`save-reward-btn-${index}`);
  const cancelBtn = document.getElementById(`cancel-reward-btn-${index}`);

  rewardText.style.display = 'none';
  editBtn.style.display = 'none';
  rewardInput.style.display = 'inline-block';
  saveBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'inline-block';
  rewardInput.focus();
  rewardInput.select();
}

function saveReward(index) {
  const rewardInput = document.getElementById(`reward-edit-${index}`);
  const newRewardName = rewardInput.value.trim();
  if (!newRewardName) {
    alert('Reward name cannot be empty');
    return;
  }

  const data = AppStorage.getStoredData();
  oldRewardName = data.rewards[index].rewardName
  if (newRewardName !== oldRewardName && data.rewards[newRewardName]) {
    alert('A reward with this name already exists');
    return;
  }
  // Rename reward in storage
  const success = AppStorage.updateReward(index, newRewardName);
  if (success) {
    populateCurrentRewards();
    loadEarnedRewards();
    showBriefMessage('✅ Reward updated', '#4caf50');
  } else {
    alert('Error updating reward. Please try again.');
  }
}

function cancelEditReward(index, rewardName) {
  const rewardText = document.getElementById(`reward-text-${index}`);
  const rewardInput = document.getElementById(`reward-edit-${index}`);
  const editBtn = document.getElementById(`edit-reward-btn-${index}`);
  const saveBtn = document.getElementById(`save-reward-btn-${index}`);
  const cancelBtn = document.getElementById(`cancel-reward-btn-${index}`);

  rewardInput.value = rewardName;
  rewardText.style.display = 'inline';
  editBtn.style.display = 'inline-block';
  rewardInput.style.display = 'none';
  saveBtn.style.display = 'none';
  cancelBtn.style.display = 'none';
}

// Reward addition notification system
function showRewardAddedNotification(rewardName) {
  // Remove any existing notification
  const existingNotification = document.getElementById('reward-added-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.id = 'reward-added-notification';
  notification.className = 'undo-notification';

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-title">✅ Reward Added</div>
      <div class="notification-subtitle">${rewardName}</div>
    </div>
    <button onclick="undoAddReward('${rewardName}')" 
            class="undo-button">
      UNDO
    </button>
  `;

  document.body.appendChild(notification);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

function undoAddReward(rewardName) {
  const data = AppStorage.getStoredData();
  if (!data || !data.rewards) {
    console.error('Cannot undo: rewards not found');
    return;
  }

  // Check if reward exists
  if (!data.rewards[rewardName]) {
    console.error('Cannot undo: reward not found');
    return;
  }

  // Use storage.js function to remove reward
  const success = AppStorage.deleteReward(rewardName);

  if (success) {
    // Hide notification
    const notification = document.getElementById('reward-added-notification');
    if (notification) {
      notification.remove();
    }

    // Show brief undo confirmation
    showBriefMessage('🔄 Reward removed', '#ff9800');

    // Refresh rewards display
    loadEarnedRewards();
  } else {
    console.error('Cannot undo: failed to remove reward');
    showBriefMessage('❌ Error removing reward', '#f44336');
  }
}

// Function to delete a reward with notification and undo
function deleteReward(rewardName) {
  const data = AppStorage.getStoredData();
  if (!data || !data.rewards[rewardName]) {
    showBriefMessage('❌ Reward not found', '#f44336');
    return;
  }

  const reward = data.rewards[rewardName];
  const activityCount = reward.activity ? reward.activity.length : 0;

  // Store reward data for potential undo
  const rewardBackup = JSON.parse(JSON.stringify(reward));

  // Remove the reward
  const success = AppStorage.deleteReward(rewardName);

  if (success) {
    // Show notification with undo option
    showRewardDeletedNotification(rewardName, rewardBackup);

    // Refresh rewards display
    loadEarnedRewards();
  } else {
    showBriefMessage('❌ Error deleting reward', '#f44336');
  }
}

// Reward deletion notification system
function showRewardDeletedNotification(rewardName, rewardBackup) {
  // Remove any existing notification
  const existingNotification = document.getElementById('reward-deleted-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.id = 'reward-deleted-notification';
  notification.className = 'undo-notification';

  const activityCount = rewardBackup.activity ? rewardBackup.activity.length : 0;

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-title">🗑️ Reward Deleted</div>
      <div class="notification-subtitle">${rewardName} (${activityCount} activities)</div>
    </div>
    <button onclick="undoDeleteReward('${rewardName}', '${encodeURIComponent(JSON.stringify(rewardBackup))}')" 
            class="undo-button">
      UNDO
    </button>
  `;

  document.body.appendChild(notification);

  // Auto-hide after 8 seconds (longer for delete actions)
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 8000);
}

function undoDeleteReward(rewardName, encodedRewardBackup) {
  try {
    const rewardBackup = JSON.parse(decodeURIComponent(encodedRewardBackup));

    // Check if reward already exists (shouldn't, but safety check)
    const data = AppStorage.getStoredData();
    if (data && data.rewards[rewardName]) {
      showBriefMessage('❌ Cannot restore: reward already exists', '#f44336');
      return;
    }

    // Add the reward back
    const addSuccess = AppStorage.addReward(rewardName);

    if (addSuccess) {
      // Restore the activities
      const currentData = AppStorage.getStoredData();
      currentData.rewards[rewardName] = rewardBackup;
      const saveSuccess = AppStorage.saveStoredData(currentData);

      if (saveSuccess) {
        // Hide notification
        const notification = document.getElementById('reward-deleted-notification');
        if (notification) {
          notification.remove();
        }

        // Show brief undo confirmation
        showBriefMessage('🔄 Reward restored', '#4caf50');

        // Refresh rewards display
        loadEarnedRewards();
      } else {
        showBriefMessage('❌ Error restoring reward data', '#f44336');
      }
    } else {
      showBriefMessage('❌ Error restoring reward', '#f44336');
    }
  } catch (error) {
    console.error('Error undoing reward deletion:', error);
    showBriefMessage('❌ Error restoring reward', '#f44336');
  }
}

// goal management

// Manage Goals Modal Functions
function showManageGoalsModal() {
    const modal = document.getElementById('manage-goals-modal');
    if (modal) {
        modal.style.display = 'block';
        populateCurrentGoals();
    }
}

function closeManageGoalsModal() {
    const modal = document.getElementById('manage-goals-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function populateCurrentGoals() {
    const goalsList = document.getElementById('current-goals-list');
    const data = AppStorage.getStoredData();

    if (!goalsList || !data.goals) return;

    goalsList.innerHTML = '';

    data.goals.forEach((goal, index) => {
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <span class="goal-text" id="goal-text-${index}">${goal}</span>
            <input type="text" class="goal-edit-input" id="goal-edit-${index}" value="${goal}" style="display: none;">
            <div class="goal-actions">
                <button class="edit-goal-btn" onclick="editGoal(${index})" id="edit-btn-${index}">Edit</button>
                <button class="save-goal-btn" onclick="saveGoal(${index})" id="save-btn-${index}" style="display: none;">Save</button>
                <button class="cancel-goal-btn" onclick="cancelEditGoal(${index})" id="cancel-btn-${index}" style="display: none;">Cancel</button>
                <button class="delete-goal-btn" onclick="deleteGoal(${index})">Delete</button>
            </div>
        `;
        goalsList.appendChild(goalItem);
    });
}

function addNewGoal() {
    const input = document.getElementById('new-goal-input');
    const newGoal = input.value.trim();

    if (!newGoal) {
        showBriefMessage('⚠️ Please enter a goal name', '#ff9800');
        input.focus();
        return;
    }

    const success = AppStorage.addGoal(newGoal);

    if (success) {
        // Clear input and refresh the goals list
        input.value = '';
        populateCurrentGoals();

        // Show success notification with undo option
        showGoalAddedNotification(newGoal);
        console.log('New goal added:', newGoal);
    } else {
        showBriefMessage('❌ Error adding goal. This goal may already exist.', '#f44336');
    }
}

function deleteGoal(goalIndex) {
    const data = AppStorage.getStoredData();
    const goalToDelete = data.goals[goalIndex];

    if (confirm(`Are you sure you want to delete the goal "${goalToDelete}"?\n\nThis will also remove this goal from any reward activities where it was used.`)) {
        // Use storage.js function to delete goal
        const success = AppStorage.deleteGoal(goalIndex);

        if (success) {
            // Refresh the goals list and rewards display
            refreshUI({ refreshRewards: true, refreshGoalsModal: true });
            console.log('Goal deleted:', goalToDelete);
        } else {
            alert('Error deleting goal. Please try again.');
        }
    }
}

function editGoal(goalIndex) {
    const goalText = document.getElementById(`goal-text-${goalIndex}`);
    const goalInput = document.getElementById(`goal-edit-${goalIndex}`);
    const editBtn = document.getElementById(`edit-btn-${goalIndex}`);
    const saveBtn = document.getElementById(`save-btn-${goalIndex}`);
    const cancelBtn = document.getElementById(`cancel-btn-${goalIndex}`);

    // Hide text and edit button, show input and save/cancel buttons
    goalText.style.display = 'none';
    editBtn.style.display = 'none';
    goalInput.style.display = 'inline-block';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';

    // Focus on the input and select all text
    goalInput.focus();
    goalInput.select();
}

function saveGoal(goalIndex) {
    const goalInput = document.getElementById(`goal-edit-${goalIndex}`);
    const newGoalText = goalInput.value.trim();

    if (!newGoalText) {
        alert('Goal cannot be empty');
        return;
    }

    const data = AppStorage.getStoredData();
    const oldGoal = data.goals[goalIndex];

    // Check if the new goal name already exists (unless it's the same goal)
    if (newGoalText !== oldGoal && data.goals.includes(newGoalText)) {
        alert('A goal with this name already exists');
        return;
    }

    // Use storage.js function to update goal
    const success = AppStorage.updateGoal(goalIndex, newGoalText);

    if (success) {
        // Refresh the goals list and rewards display
        refreshUI({ refreshRewards: true, refreshGoalsModal: true });
        console.log('Goal updated:', oldGoal, '->', newGoalText);
    } else {
        alert('Error updating goal. Please try again.');
    }
}

function cancelEditGoal(goalIndex) {
    const goalText = document.getElementById(`goal-text-${goalIndex}`);
    const goalInput = document.getElementById(`goal-edit-${goalIndex}`);
    const editBtn = document.getElementById(`edit-btn-${goalIndex}`);
    const saveBtn = document.getElementById(`save-btn-${goalIndex}`);
    const cancelBtn = document.getElementById(`cancel-btn-${goalIndex}`);

    // Reset input to original value
    const data = AppStorage.getStoredData();
    goalInput.value = data.goals[goalIndex];

    // Show text and edit button, hide input and save/cancel buttons
    goalText.style.display = 'inline';
    editBtn.style.display = 'inline-block';
    goalInput.style.display = 'none';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

// Goal addition notification system
function showGoalAddedNotification(goalName) {
  // Remove any existing notification
  const existingNotification = document.getElementById('goal-added-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.id = 'goal-added-notification';
  notification.className = 'undo-notification';

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-title">✅ Goal Added</div>
      <div class="notification-subtitle">${goalName}</div>
    </div>
    <button onclick="undoAddGoal('${goalName}')" 
            class="undo-button">
      UNDO
    </button>
  `;

  document.body.appendChild(notification);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

function undoAddGoal(goalName) {
  const data = AppStorage.getStoredData();
  if (!data || !data.goals) {
    console.error('Cannot undo: goals not found');
    return;
  }

  // Find the goal index
  const goalIndex = data.goals.findIndex(goal => goal === goalName);

  if (goalIndex !== -1) {
    // Use storage.js function to remove goal
    const success = AppStorage.deleteGoal(goalIndex);

    if (success) {
      // Hide notification
      const notification = document.getElementById('goal-added-notification');
      if (notification) {
        notification.remove();
      }

      // Show brief undo confirmation
      showBriefMessage('🔄 Goal removed', '#ff9800');

      // Refresh goals list and rewards display
      refreshUI({ refreshRewards: true, refreshGoalsModal: true });
    } else {
      console.error('Cannot undo: failed to remove goal');
    }
  } else {
    console.error('Cannot undo: goal not found');
  }
}


function deleteActivity(rewardIndex, activityIndex) {
  AppStorage.removeActivityFromReward(rewardIndex, activityIndex);
  closeActivityHistoryModal();
  // Refresh display
  loadEarnedRewards();
}


// Undo notification system
function showUndoNotification(rewardName, completedGoal, activityEntry) {
  // Remove any existing notification
  const existingNotification = document.getElementById('undo-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.id = 'undo-notification';
  notification.className = 'undo-notification';

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-title">✅ Added to ${rewardName}</div>
      <div class="notification-subtitle">${completedGoal}</div>
    </div>
    <button onclick="undoLastActivity('${rewardName}', '${activityEntry}')" 
            class="undo-button">
      UNDO
    </button>
  `;

  document.body.appendChild(notification);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

function undoLastActivity(rewardName, activityEntry) {
  const data = AppStorage.getStoredData();
  if (!data || !data.rewards[rewardName]) {
    console.error('Cannot undo: reward not found');
    return;
  }

  // Find the activity index
  const activities = data.rewards[rewardName].activity;
  const activityIndex = activities.findIndex(activity => activity === activityEntry);

  if (activityIndex !== -1) {
    // Use storage.js function to remove activity
    const success = AppStorage.removeActivityFromReward(rewardName, activityIndex);

    if (success) {
      // Hide notification
      const notification = document.getElementById('undo-notification');
      if (notification) {
        notification.remove();
      }

      // Show brief undo confirmation
      showBriefMessage('🔄 Activity removed', '#ff9800');

      // Refresh display
      loadEarnedRewards();
    } else {
      console.error('Cannot undo: failed to remove activity');
    }
  } else {
    console.error('Cannot undo: activity not found');
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
    loadEarnedRewards();
  }

  if (refreshGoalsModal) {
    // Only refresh goals modal if it's currently open
    const goalmodal = document.getElementById('manage-goals-modal');
    if (goalmodal && goalmodal.style.display === 'block') {
      populateCurrentGoals();
    }
    const rewardmodal = document.getElementById('manage-rewards-modal');
    if (rewardmodal && rewardmodal.style.display === 'block') {
      populateCurrentRewards();
    }
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
        // Check if we're editing a goal
        if (event.target.classList.contains('goal-edit-input')) {
            const inputId = event.target.id;
            const goalIndex = inputId.split('-')[2]; // Extract index from 'goal-edit-{index}'
            saveGoal(parseInt(goalIndex));
        }
        if (event.target.classList.contains('reward-edit-input')) {
            const inputId = event.target.id;
            const rewardIndex = inputId.split('-')[2]; // Extract index from 'reward-edit-{index}'
            saveReward(parseInt(rewardIndex));
        }
    }

    if (event.key === 'Escape') {
        // Check if we're editing a goal
        if (event.target.classList.contains('goal-edit-input')) {
            const inputId = event.target.id;
            const goalIndex = inputId.split('-')[2]; // Extract index from 'goal-edit-{index}'
            cancelEditGoal(parseInt(goalIndex));
        }
        if (event.target.classList.contains('reward-edit-input')) {
            const inputId = event.target.id;
            const rewardIndex = inputId.split('-')[2]; // Extract index from 'reward-edit-{index}'
            cancelEditReward(parseInt(rewardIndex));
        }
    }
});



