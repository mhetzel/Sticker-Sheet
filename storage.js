// Storage module for handling all localStorage interactions
// Provides a clean API for data persistence in the Goals & Rewards Tracker

// Default app configuration
const DEFAULT_APP_CONFIG = {
  rewards: [],
  goals: [],
  target: 11,
  showHelp: true
};

// Storage key for localStorage
const STORAGE_KEY = 'rewardTrackerData';

/**
 * Initialize app data from localStorage or return defaults
 * @returns {Object} App data object with rewards, goals, and target
 */
function initialize() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    parsedData = { ...DEFAULT_APP_CONFIG };
    if (storedData) {
      console.log('Loading data from localStorage');
      parsedData = JSON.parse(storedData);
      if (parsedData.goals && typeof parsedData.goals[0] === 'string') 
      {
        oldGoals = parsedData.goals;
        newGoals = oldGoals.map(goal => ({ name: goal, required: false }));
        parsedData.goals = newGoals;
        console.log('Migrated old goals format to new format');
      }
        
      // Validate structure
      if (!Array.isArray(parsedData.goals) || !parsedData.goals.every(goal => typeof goal === 'object' && goal.name && typeof goal.required === 'boolean')) {
        console.error('Invalid goals format - resetting to default');
        parsedData = { ...DEFAULT_APP_CONFIG };
      }
    } else {
      console.log('First time load - using default configuration');
      console.log('Default data stored in localStorage');
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
    console.log('Falling back to default configuration');
  }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
}

/**
 * Get stored data from localStorage
 * @returns {Object|null} Parsed data object or null if not found
 */
function getStoredData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

function hideHelp() {
  const data = getStoredData();
  if (data) {
    data.showHelp = false;
    saveStoredData(data);
  }
}

function shouldShowHelp() {
  const data = getStoredData();
  return data ? data.showHelp : DEFAULT_APP_CONFIG.showHelp;
}

/**
 * Save data to localStorage
 * @param {Object} data - Data object to save
 * @returns {boolean} Success status
 */
function saveStoredData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('App data saved to localStorage');
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Add an activity to a specific reward
 * @param {number} rewardIndex - Index of the reward
 * @param {string} activityDescription - Description of the completed activity
 * @returns {boolean} Success status
 */
function addActivityToReward(rewardIndex, activityDescription) {
  const data = getStoredData();
  if (!data || !data.rewards[rewardIndex]) {
    console.error('Invalid reward index or no data found');
    return false;
  }

  // Initialize activity array if it doesn't exist
  if (!data.rewards[rewardIndex].activity) {
    data.rewards[rewardIndex].activity = [];
  }

  // Add the activity
  data.rewards[rewardIndex].activity.push(activityDescription);

  // Save back to localStorage
  return saveStoredData(data);
}

/**
 * Remove an activity from a reward by index
 * @param {number} rewardIndex - Index of the reward
 * @param {number} activityIndex - Index of activity to remove
 * @returns {boolean} Success status
 */
function removeActivityFromReward(rewardIndex, activityIndex) {
  const data = getStoredData();
  if (!data || !data.rewards[rewardIndex]) {
    console.error('Invalid reward index or no data found');
    return false;
  }

  const activities = data.rewards[rewardIndex].activity;
  if (!activities || activityIndex < 0 || activityIndex >= activities.length) {
    console.error('Invalid activity index');
    return false;
  }

  // Remove the activity
  activities.splice(activityIndex, 1);

  // Save back to localStorage
  return saveStoredData(data);
}

/**
 * Add a new reward to the system
 * @param {string} rewardName - Name of the new reward
 * @returns {boolean} Success status
 */
function addReward(rewardName) {
  const data = getStoredData();
  if (!data) {
    console.error('No data found');
    return false;
  }

  // Check if reward already exists
  for (const reward of data.rewards) {
    if (reward.rewardName === rewardName) {
      console.error('Reward already exists');
      return false;
    }
  }

  // Add new reward
  const newReward = {
    rewardName: rewardName,
    activity: []
  };

  data.rewards.push(newReward);

  return saveStoredData(data);
}

/**
 * Remove a reward from the system
 * @param {number} rewardIndex - Index of the reward to remove
 * @returns {boolean} Success status
 */
function deleteReward(rewardIndex) {
  const data = getStoredData();
  if (!data) {
    console.error('No data found');
    return false;
  }

  if (rewardIndex < 0 || rewardIndex >= data.rewards.length) {
    console.error('Invalid reward index');
    return false;
  }

  // Remove the reward
  data.rewards.splice(rewardIndex, 1);

  return saveStoredData(data);
}

function updateReward(rewardIndex, newRewardName) {
  const data = getStoredData();
  if (!data || !data.rewards[rewardIndex]) {
    console.error('Invalid reward index or no data found');
    return false;
  }

  // Check if reward already exists
  for (let i = 0; i < data.rewards.length; i++) {
    if (i !== rewardIndex && data.rewards[i].rewardName === newRewardName) {
      console.error('Reward already exists');
      return false;
    }
  }

  // Update the reward name
  data.rewards[rewardIndex].rewardName = newRewardName;
  return saveStoredData(data);
}

/**
 * Check if required goals for a reward are completed for today
 * @param {number} rewardIndex - Index of the reward
 * @returns {boolean} True if all required goals are completed for today
 */
function areRequiredGoalsCompletedToday(rewardIndex) {
  const data = getStoredData();
  if (!data || !data.rewards[rewardIndex]) {
    return false;
  }
  const requiredGoals = data.goals.filter(goal => goal.required);
  if (!requiredGoals.length) return true;
  const today = new Date().toISOString().split('T')[0];
  // Check if each required goal has an activity for today in this reward
  const activities = data.rewards[rewardIndex].activity || [];
  return requiredGoals.every(goal =>
    activities.some(activity => activity === `${goal.name} completed on ${today}`)
  );
}

/**
 * Add a new goal to the system
 * @param {string} goalName - Name of the new goal
 * @returns {boolean} Success status
 */
function addGoal(goalName, isRequired = false) {
  const data = getStoredData();
  if (!data) {
    console.error('No data found');
    return false;
  }

  const goal = { name: goalName, required: isRequired };

  if (!data.goals.some(g => g.name === goal.name && g.required === goal.required)) {
    data.goals.push(goal);
  }

  return saveStoredData(data);
}

/**
 * Delete a goal and remove it from all reward activities
 * @param {number} goalIndex - Index of goal to delete
 * @returns {boolean} Success status
 */
function deleteGoal(goalIndex) {
  const data = getStoredData();
  if (!data || goalIndex < 0 || goalIndex >= data.goals.length) {
    console.error('Invalid goal index or no data found');
    return false;
  }

  const goalToDelete = data.goals[goalIndex];

  // Remove goal from goals array
  data.goals.splice(goalIndex, 1);

  // Remove this goal from all reward activities
  Object.keys(data.rewards).forEach(rewardName => {
    const activities = data.rewards[rewardName].activity;
    const filteredActivities = activities.filter(activity => 
      !activity.includes(goalToDelete + ' completed on ')
    );
    data.rewards[rewardName].activity = filteredActivities;
  });

  return saveStoredData(data);
}

/**
 * Update a goal name and update all references in reward activities
 * @param {number} goalIndex - Index of goal to update
 * @param {string} newGoalName - New name for the goal
 * @returns {boolean} Success status
 */
function updateGoal(goalIndex, newGoalName, isRequired) {
  const data = getStoredData();
  if (!data || goalIndex < 0 || goalIndex >= data.goals.length) {
    console.error('Invalid goal index or no data found');
    return false;
  }

  const oldGoal = data.goals[goalIndex];

  const newGoal = { name: newGoalName, required: isRequired };

  // Check if the new goal name already exists (unless it's the same goal)
  if (newGoal !== oldGoal && (!data.goals.some(g => g.name === newGoal.name && g.required === newGoal.required))) {
    console.error('Goal name already exists');
    return false;
  }

  // Update the goal in the data
  data.goals[goalIndex] = newGoal;

  // Update this goal in all reward activities where it was used
  Object.keys(data.rewards).forEach(rewardName => {
    const activities = data.rewards[rewardName].activity;
    const updatedActivities = activities.map(activity => {
      if (activity.includes(oldGoal + ' completed on ')) {
        return activity.replace(oldGoal + ' completed on ', newGoalName + ' completed on ');
      }
      return activity;
    });
    data.rewards[rewardName].activity = updatedActivities;
  });

  return saveStoredData(data);
}

/**
 * Clear all data and reset to defaults
 * @returns {boolean} Success status
 */
function resetToDefaults() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Data reset to defaults');
    return true;
  } catch (error) {
    console.error('Error resetting data:', error);
    return false;
  }
}

/**
 * Update the target activity count
 * @param {number} newTarget - New target count (must be positive integer)
 * @returns {boolean} Success status
 */
function updateTarget(newTarget) {
  const data = getStoredData();
  if (!data) {
    console.error('No data found');
    return false;
  }

  // Validate target
  if (!Number.isInteger(newTarget) || newTarget < 1) {
    console.error('Target must be a positive integer');
    return false;
  }
  // Update target
  data.target = newTarget;

  return saveStoredData(data);
}

/**
 * Get app configuration (target, etc.)
 * @returns {Object} Configuration object
 */
function getTarget() {
  const data = getStoredData();
  return data ? data.target : DEFAULT_APP_CONFIG.target;
}

// Export functions to global scope for use by index.js
window.AppStorage = {
  addGoal,
  updateGoal,
  deleteGoal,
  addReward,
  deleteReward,
  updateReward,
  removeActivityFromReward,
  addActivityToReward,
  getTarget,
  updateTarget,
  shouldShowHelp,
  hideHelp,
  getStoredData,
  resetToDefaults,
  areRequiredGoalsCompletedToday,
  saveStoredData,
  initialize
};
