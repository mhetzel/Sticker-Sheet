// act as a bank for activities that can be spent on rewards. 
// This is separate from points, which are just a tally of how many activities have been completed.

// This file contains functions related to managing the activities bank, 
// including adding completed activities, spending them on rewards, 
// and moving them back to the bank if a reward is unclaimed.  


function showManageBankModal() {
  const modal = document.getElementById('manage-bank-modal');
  if (modal) {
    modal.style.display = 'block';
  }
  showBankActivityHistory();
}

function closeManageBankModal() {
  const modal = document.getElementById('manage-bank-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}


function closeRewardModal() {
  const modal = document.getElementById('reward-selection-modal');
  if (modal) {
    modal.remove();
  }
}

// show list of rewards to spend points on
function showRewardsSelectionModal() {
  const rewards = AppStorage.getRewards();
  const activities = AppStorage.getActivities();

  // Create modal backdrop
  const modalBackdrop = document.createElement('div');
  modalBackdrop.id = 'reward-selection-modal';
  modalBackdrop.className = 'modal-backdrop';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content-large';

  let modalHTML = `
    <div class="reward-modal-header">
      <h2 class="reward-modal-title">Spend Your Points</h2>
      <div class="reward-modal-instruction">Select a reward to spend your points on:</div>
    </div>`

  rewards.forEach(reward => {
    modalHTML += `<button onclick="confirmReward('${reward.rewardName}')" 
              class="reward-button">${reward.rewardName}</button>`;
  });

  modalContent.innerHTML = modalHTML;
  modalBackdrop.appendChild(modalContent);
  document.body.appendChild(modalBackdrop);

  // Close modal when clicking backdrop
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeRewardModal();
    }
  });

}

function confirmReward(selectedReward) {
  const success = AppStorage.spendActivityOnReward(selectedReward);
  if (success) {
    closeRewardModal();
  }
  // TODO need to somehow refresh rewards display
  showManageBankModal();
}


// Add activity
function showBankGoalSelectionModal() {
  try {
    // Get current data from localStorage
    const goals = AppStorage.getGoals();

    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'bank-goal-selection-modal';
    modalBackdrop.className = 'modal-backdrop';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-large';

    let modalHTML = `
      <div class="goal-modal-header">
        <div class="goal-modal-status">Select a completed goal to add to your bank:</div>
      </div>

      <div class="goal-buttons-container">
        <div class="goal-buttons-grid">
    `;

    const requiredCompleted = AppStorage.areRequiredGoalsCompletedToday();
    // Add goal buttons
    goals.forEach(goal => {
      // If there are required goals, and not all are completed, only show required goals
      
      const showGoal = requiredCompleted || goal.required;
      if (showGoal) {
        modalHTML += `
          <button onclick="confirmBankGoal('${goal.name}')" 
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
        <button onclick="closeBankGoalModal()" class="cancel-button">
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
        closeBankGoalModal();
      }
    });

  } catch (error) {
    console.error('Error showing goal selection:', error);
    alert('Error loading goals. Please try again.');
  }
}

function undoLastBankActivity(activityEntry) {
  const activities = AppStorage.getActivities();
  if (!activities || activities.length === 0) {
    console.error('Cannot undo: no activities found');
    return;
  }
  // Find the activity index
  const activityIndex = activities.findIndex(activity => activity === activityEntry);

  if (activityIndex !== -1) {
    // Use storage.js function to remove activity
    const success = AppStorage.removeActivityFromBank(activityIndex);

    if (success) {
      // Hide notification
      const notification = document.getElementById('undo-notification');
      if (notification) {
        notification.remove();
      }

      // Show brief undo confirmation
      showBriefMessage('🔄 Activity removed', '#ff9800');

      // Refresh display
      showManageBankModal();
    } else {
      console.error('Cannot undo: failed to remove activity');
    }
  } else {
    console.error('Cannot undo: activity not found');
  }
}

// Undo notification system
function showUndoBankNotification(completedGoal, activityEntry) {
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
      <div class="notification-title">✅ Added to bank</div>
      <div class="notification-subtitle">${completedGoal}</div>
    </div>
    <button onclick="undoLastBankActivity('${activityEntry}')" 
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

function confirmBankGoal(completedGoal) {
  // Create activity entry with current date
  const today = new Date().toLocaleDateString('en-CA');
  const activityEntry = `${completedGoal} completed on ${today}`;

  // Add activity directly to the main app data
  const success = AppStorage.addActivityToBank(activityEntry);

  if (success) {
    // Show subtle notification with undo option
    showUndoBankNotification(completedGoal, activityEntry);

    // Close modal and refresh displays
    closeBankGoalModal();

    // Refresh rewards display immediately
    showManageBankModal();
  } else {
    alert('Error adding activity to reward. Please try again.');
  }
}

function closeBankGoalModal() {
  const modal = document.getElementById('bank-goal-selection-modal');
  if (modal) {
    modal.remove();
  }
}

function deleteBankActivity(activityIndex) {
  AppStorage.removeActivityFromBank(activityIndex);
  closeActivityHistoryModal();
  // Refresh display
  showManageBankModal();
}

function showBankActivityHistory() {
  const activities = AppStorage.getActivities();
  const target = AppStorage.getTarget();
  const isEarned = activities.length >= target;
  const spendable = activities.length > 0;

  activityDiv = document.getElementById('current-activities-list');

  let modalHTML = `
    <div class="activity-history-header">
      <div class="activity-history-count">Activity History (${activities.length} activities)</div>
    </div>
  `;

  modalHTML += `
    <div class="modal-actions">
      ${!isEarned ? `
        <button onclick="showBankGoalSelectionModal();" 
                class="secondary-button">
          📝 Add Activity
        </button>
      ` : ''}
      ${spendable ? `
        <button onclick="showRewardsSelectionModal();" 
                class="secondary-button">
          📝 Spend Points
        </button>
      ` : ''}
    </div>
  `;

  if (activities.length === 0) {
    modalHTML += `
      <div class="no-activities-message">
        No activities completed yet.
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
            <button onclick="deleteBankActivity(${index})" 
                    class="delete-activity-button"
                    title="Delete this activity">
              🗑️ Delete
            </button>
          </div>
        </div>
      `;
    });

    modalHTML += '</div>';
  }

  activityDiv.innerHTML = modalHTML;
}

// Function to initialize the app structure and styles
function initialize() {
  const activities = AppStorage.getActivities();
  activityCount = activities ? activities.length : 0;
  buttonHTML = '<button id="manage-bank-btn" class="action-btn">🏆 Manage Activities</button>'
  bankDiv = document.getElementsByClassName('bank')[0];
  bankDiv.insertAdjacentHTML('beforeend', buttonHTML);

  modalHTML = `
      <div id="manage-bank-modal" class="modal">
      <div class="modal-content">
        <span class="close" id="close-manage-bank">&times;</span>
        <div id="current-activities-list" class="current-activities-list">
        </div>
    </div>`;

  // insert modal html after the div with class=actions
  actionsDiv = document.getElementsByClassName('actions')[0];
  actionsDiv.insertAdjacentHTML('afterend', modalHTML);
  
  // Manage activities bank button
  const manageBankBtn = document.getElementById('manage-bank-btn');
  if (manageBankBtn) {
    manageBankBtn.addEventListener('click', showManageBankModal);
  }

  // Close manage activities bank modal
  const closeManageBank = document.getElementById('close-manage-bank');
  if (closeManageBank) {
    closeManageBank.addEventListener('click', closeManageBankModal);
  }
}

// Export functions to global scope for use by index.js
window.Activities = {
    initialize
};

