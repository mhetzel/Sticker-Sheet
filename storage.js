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
function initializeAppData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (storedData) {
      console.log('Loading data from localStorage');
      return JSON.parse(storedData);
    } else {
      console.log('First time load - using default configuration');
      const data = { ...DEFAULT_APP_CONFIG };

      // Store in localStorage for future use
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Default data stored in localStorage');

      return data;
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
    console.log('Falling back to default configuration');
    return { ...DEFAULT_APP_CONFIG };
  }
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
  for (const reward of Object.keys(data.rewards)) {
    if (reward === rewardName) {
      console.error('Reward already exists');
      return false;
    }
  }

  // Add new reward
  newReward = {
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
  for (const reward of Object.keys(data.rewards)) {
    if (reward === newRewardName) {
      console.error('Reward already exists');
      return false;
    }
  }

  // Rename the reward
  data.rewards[rewardIndex].rewardName = newRewardName;

  return saveStoredData(data);
}

/**
 * Add a new goal to the system
 * @param {string} goalName - Name of the new goal
 * @returns {boolean} Success status
 */
function addGoal(goalName) {
  const data = getStoredData();
  if (!data) {
    console.error('No data found');
    return false;
  }

  // Check if goal already exists
  if (data.goals.includes(goalName)) {
    console.error('Goal already exists');
    return false;
  }

  // Add new goal
  data.goals.push(goalName);

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
function updateGoal(goalIndex, newGoalName) {
  const data = getStoredData();
  if (!data || goalIndex < 0 || goalIndex >= data.goals.length) {
    console.error('Invalid goal index or no data found');
    return false;
  }

  const oldGoal = data.goals[goalIndex];

  // Check if the new goal name already exists (unless it's the same goal)
  if (newGoalName !== oldGoal && data.goals.includes(newGoalName)) {
    console.error('Goal name already exists');
    return false;
  }

  // Update the goal in the data
  data.goals[goalIndex] = newGoalName;

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
function getAppConfig() {
  const data = getStoredData();
  return data ? {
    target: data.target || DEFAULT_APP_CONFIG.target,
    goalsCount: data.goals ? data.goals.length : 0,
    rewardsCount: data.rewards ? Object.keys(data.rewards).length : 0
  } : DEFAULT_APP_CONFIG;
}

// Export functions to global scope for use by index.js
window.AppStorage = {
  getStoredData,
  saveStoredData,
  addActivityToReward,
  shouldShowHelp,
  hideHelp,
  removeActivityFromReward,
  addGoal,
  deleteGoal,
  updateGoal,
  addReward,
  deleteReward,
  updateReward,
  resetToDefaults,
  getAppConfig,
  updateTarget
};

// Also expose initializeAppData globally
window.initializeAppData = initializeAppData;
