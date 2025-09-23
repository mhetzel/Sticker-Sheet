
// Add activity to reward
function showGoalSelectionModal(selectedReward) {
  try {
    // Get current data from localStorage

    const goals = AppStorage.getGoals();
    const rewards = AppStorage.getRewards();
    const target = AppStorage.getTarget();
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

    const requiredCompleted = AppStorage.areRequiredGoalsCompletedToday(selectedReward);
    // Add goal buttons
    goals.forEach(goal => {
      // If there are required goals, and not all are completed, only show required goals
      
      const showGoal = requiredCompleted || goal.required;
      if (showGoal) {
        modalHTML += `
          <button onclick="confirmGoalForReward(${selectedReward},'${currentRewardName}', '${goal.name}')" 
                  class="goal-button">
            🎯 ${goal.name}
          </button>
        `;
      }
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
  const today = new Date().toLocaleDateString('en-CA');
  const activityEntry = `${completedGoal} completed on ${today}`;

  // Add activity directly to the main app data
  const success = AppStorage.addActivityToReward(rewardIndex, activityEntry);

  if (success) {
    // Show subtle notification with undo option
    showUndoNotification(rewardName, rewardIndex, completedGoal, activityEntry);

    // Close modal and refresh displays
    closeGoalModal();

    // Refresh rewards display immediately
    loadRewards();
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
    const rewards = AppStorage.getRewards();
    if (!rewards || !rewards[rewardIndex]) {
      alert('No data found for this reward.');
      return;
    }

    const reward = rewards[rewardIndex];
    const activities = reward.activity || [];
    const target = AppStorage.getTarget();
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


// Function to load and display rewards
function loadRewards() {
  try {
    const rewards = AppStorage.getRewards();
    const target = AppStorage.getTarget();

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

    // sort in progressRewards by progress descending
    progressRewards.sort((a, b) => b.progress - a.progress);

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
          <button onclick="internalDeleteReward('${reward.index}', '${reward.name}'); event.stopPropagation();" 
                  class="delete-reward-button"
                  title="Delete this reward">
            🗑️
          </button>
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
        <button onclick="loadRewards()" class="refresh-button">
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
  const rewards = AppStorage.getRewards();
  if (!rewardsList || !rewards) return;

  rewardsList.innerHTML = '';

  rewards.forEach((reward, index) => {
    const rewardName = reward.rewardName;
    rewardsList.innerHTML += `
      <div class="reward-item">
        <span class="reward-text" id="reward-text-${index}">${rewardName}</span>
        <input type="text" class="reward-edit-input" id="reward-edit-${index}" value="${rewardName}" style="display: none;">
        <div class="reward-actions">
          <button class="edit-reward-btn" onclick="editReward(${index})" id="edit-reward-btn-${index}">Edit</button>
          <button class="save-reward-btn" onclick="saveReward(${index})" id="save-reward-btn-${index}" style="display: none;">Save</button>
          <button class="cancel-reward-btn" onclick="cancelEditReward(${index})" id="cancel-reward-btn-${index}" style="display: none;">Cancel</button>
          <button class="delete-reward-btn" onclick="internalDeleteReward(${index}, '${rewardName}')">Delete</button>
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
  const rewardIndex = AppStorage.getRewards().length - 1;
  if (success) {
    input.value = '';
    populateCurrentRewards();
    showRewardAddedNotification(newReward, rewardIndex);
  } else {
    showBriefMessage('❌ Error adding reward. This reward may already exist.', '#f44336');
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

  const rewards = AppStorage.getRewards();
  oldRewardName = rewards[index].rewardName
  if (newRewardName !== oldRewardName && rewards[newRewardName]) {
    alert('A reward with this name already exists');
    return;
  }
  // Rename reward in storage
  const success = AppStorage.updateReward(index, newRewardName);
  if (success) {
    populateCurrentRewards();
    loadRewards();
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
function showRewardAddedNotification(rewardName, rewardIndex) {
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
    <button onclick="undoAddReward(${rewardIndex})" 
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

function undoAddReward(rewardIndex) {
  const rewards = AppStorage.getRewards();
  if (!rewards) {
    console.error('Cannot undo: rewards not found');
    return;
  }

  // Check if reward exists
  if (!rewards[rewardIndex]) {
    console.error('Cannot undo: reward not found');
    return;
  }

  // Use storage.js function to remove reward
  const success = AppStorage.deleteReward(rewardIndex);

  if (success) {
    // Hide notification
    const notification = document.getElementById('reward-added-notification');
    if (notification) {
      notification.remove();
    }

    // Show brief undo confirmation
    showBriefMessage('🔄 Reward removed', '#ff9800');

    // Refresh rewards display
    loadRewards();
  } else {
    console.error('Cannot undo: failed to remove reward');
    showBriefMessage('❌ Error removing reward', '#f44336');
  }
}

// Function to delete a reward with notification and undo
function internalDeleteReward(rewardIndex, rewardName) {
  const rewards = AppStorage.getRewards();
  if (!rewards || !rewards[rewardIndex]) {
    showBriefMessage('❌ Reward not found', '#f44336');
    return;
  }

  const reward = rewards[rewardIndex];
  const activityCount = reward.activity ? reward.activity.length : 0;

  // Store reward data for potential undo
  const rewardBackup = JSON.parse(JSON.stringify(reward));

  // Remove the reward
  const success = AppStorage.deleteReward(rewardIndex);
  console.log('deleted reward')
  if (success) {
    console.log('trying to show notification')
    // Show notification with undo option
    showRewardDeletedNotification(rewardName, rewardBackup);

    // Refresh rewards display
    loadRewards();
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
    rewards = AppStorage.getRewards();
    if (rewards && rewards[rewardName]) {
      showBriefMessage('❌ Cannot restore: reward already exists', '#f44336');
      return;
    }

    // Add the reward back
    const addSuccess = AppStorage.addReward(rewardName);
    rewards = AppStorage.getRewards();
    const rewardIndex = rewards.length - 1;

    if (addSuccess) {
      // Restore the activities
      rewardBackup.activities.forEach((activity) => {
        AppStorage.addActivityToReward(rewardIndex, activity)
      })

      if (saveSuccess) {
        // Hide notification
        const notification = document.getElementById('reward-deleted-notification');
        if (notification) {
          notification.remove();
        }

        // Show brief undo confirmation
        showBriefMessage('🔄 Reward restored', '#4caf50');

        // Refresh rewards display
        loadRewards();
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

function undoLastActivity(rewardIndex, activityEntry) {
  const rewards = AppStorage.getRewards();
  if (!rewards || !rewards[rewardIndex]) {
    console.error('Cannot undo: reward not found');
    return;
  }

  // Find the activity index
  const activities = rewards[rewardIndex].activity;
  const activityIndex = activities.findIndex(activity => activity === activityEntry);

  if (activityIndex !== -1) {
    // Use storage.js function to remove activity
    const success = AppStorage.removeActivityFromReward(rewardIndex, activityIndex);

    if (success) {
      // Hide notification
      const notification = document.getElementById('undo-notification');
      if (notification) {
        notification.remove();
      }

      // Show brief undo confirmation
      showBriefMessage('🔄 Activity removed', '#ff9800');

      // Refresh display
      loadRewards();
    } else {
      console.error('Cannot undo: failed to remove activity');
    }
  } else {
    console.error('Cannot undo: activity not found');
  }
}

// Undo notification system
function showUndoNotification(rewardName, rewardIndex, completedGoal, activityEntry) {
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
    <button onclick="undoLastActivity(${rewardIndex}, '${activityEntry}')" 
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

function initialize() {
  buttonHTML = '<button id="manage-rewards-btn" class="action-btn">🏆 Manage Rewards</button>'
  actionsDiv = document.getElementsByClassName('actions')[0];
  actionsDiv.insertAdjacentHTML('beforeend', buttonHTML);

  modalHTML = `
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
    </div>`;

  // insert modal html after the div with class=actions
  actionsDiv.insertAdjacentHTML('afterend', modalHTML);
  
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

}

function refresh() {
  const rewardmodal = document.getElementById('manage-rewards-modal');
  if (rewardmodal && rewardmodal.style.display === 'block') {
    populateCurrentRewards();
  }
}

function handleClickEvent(event) {
  const manageRewardsModal = document.getElementById('manage-rewards-modal');
  if (event.target === manageRewardsModal) {
    closeManageRewardsModal();
  }
}

function deleteActivity(rewardIndex, activityIndex) {
  AppStorage.removeActivityFromReward(rewardIndex, activityIndex);
  closeActivityHistoryModal();
  // Refresh display
  loadRewards();
}

function handleEnterEvent(event) {
  if (event.target.classList.contains('reward-edit-input')) {
      const inputId = event.target.id;
      const rewardIndex = inputId.split('-')[2]; // Extract index from 'reward-edit-{index}'
      saveReward(parseInt(rewardIndex));
  }
}

function handleEscEvent(event) {
  if (event.target.classList.contains('reward-edit-input')) {
      const inputId = event.target.id;
      const rewardIndex = inputId.split('-')[2]; // Extract index from 'reward-edit-{index}'
      cancelEditReward(parseInt(rewardIndex));
  }
}

window.Rewards = {
  initialize,
  loadRewards,
  refresh,
  handleEnterEvent,
  handleEscEvent,
  handleClickEvent
};