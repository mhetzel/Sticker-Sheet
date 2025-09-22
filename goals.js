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

function refresh() {
  const goalmodal = document.getElementById('manage-goals-modal');
  if (goalmodal && goalmodal.style.display === 'block') {
    populateCurrentGoals();
  }
}

function handleEnterEvent(event) {
  // Check if we're editing a goal
  if (event.target.classList.contains('goal-edit-input')) {
      const inputId = event.target.id;
      const goalIndex = inputId.split('-')[2]; // Extract index from 'goal-edit-{index}'
      saveGoal(parseInt(goalIndex));
  }
}

function handleEscEvent(event) {
  // Check if we're editing a goal
  if (event.target.classList.contains('goal-edit-input')) {
      const inputId = event.target.id;
      const goalIndex = inputId.split('-')[2]; // Extract index from 'goal-edit-{index}'
      cancelEditGoal(parseInt(goalIndex));
  }
}

function handleClickEvent(event) {
  const manageGoalsModal = document.getElementById('manage-goals-modal');
  if (event.target === manageGoalsModal) {
    closeManageGoalsModal();
  }
}

function initialize() {
  // add goal button
  const buttonHTML = '<button id="manage-goals-btn" class="action-btn">⚙️ Manage Goals</button>';
  actionsDiv = document.getElementsByClassName('actions')[0];
  actionsDiv.insertAdjacentHTML('beforeend', buttonHTML);

  modalHtml = `
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
    `;

  // insert modal html after the div with class=actions
  actionsDiv.insertAdjacentHTML('afterend', modalHtml);

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
}

window.Goals = {
  initialize,
  refresh,
  handleEnterEvent,
  handleEscEvent,
  handleClickEvent
};