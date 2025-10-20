// DOM Elements
const completeSetBtn = document.getElementById('complete-set-btn');
const setsCountElement = document.getElementById('sets-count');
const restTimeElement = document.getElementById('rest-time');
const totalRestTimeElement = document.getElementById('total-rest-time');
const totalTimeElement = document.getElementById('total-time');
const bestTimeElement = document.getElementById('best-time');
const depthBar = document.getElementById('depth-bar');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const sensorToggleBtn = document.getElementById('sensor-toggle-btn');
const exerciseFeedback = document.getElementById('exercise-feedback');
const accuracyValue = document.getElementById('accuracy-value');
const precisionValue = document.getElementById('precision-value');
const rangeValue = document.getElementById('range-value');

// Navigation Elements
const toolsBtn = document.getElementById('tools-btn');
const aboutBtn = document.getElementById('about-btn');
const helpBtn = document.getElementById('help-btn');
const toolsModal = document.getElementById('tools-modal');
const aboutModal = document.getElementById('about-modal');
const helpModal = document.getElementById('help-modal');
const closeBtns = document.querySelectorAll('.close-btn');

// State variables
let setsCount = 0;
let restSeconds = 0;
let totalRestSeconds = 0;
let totalSeconds = 0;
let bestTime = null;
let isWorkoutStarted = false;
let isWorkoutPaused = false;
let isSensorEnabled = true;
let restTimer;
let totalTimer;
let sensorLevel = 96;
let setTimes = [];

// Format time in seconds to appropriate format
function formatTime(seconds, isTotalWorkout = false) {
    if (isTotalWorkout) {
        // For total workout time: convert to hh:mm:ss after 1 hour
        if (seconds < 60) {
            return seconds + 's';
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
        } else {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return hours + 'h ' + (mins < 10 ? '0' : '') + mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
        }
    } else {
        // For other times: convert to mm:ss after 60 seconds
        if (seconds < 60) {
            return seconds + 's';
        } else {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
        }
    }
}

// Initialize
function init() {
    updateDisplay();
    updateSensor();
}

// Update all displays
function updateDisplay() {
    setsCountElement.textContent = setsCount;
    restTimeElement.textContent = formatTime(restSeconds);
    totalRestTimeElement.textContent = formatTime(totalRestSeconds);
    totalTimeElement.textContent = formatTime(totalSeconds, true);
    
    // Update rest time color based on state and progress
    if (isWorkoutPaused) {
        restTimeElement.style.color = '#e74c3c'; // Red for paused
    } else if (restSeconds >= 300) { // 5 minutes
        restTimeElement.style.color = '#e74c3c'; // Red for exceeding 5 minutes
        completeSetBtn.classList.add('pulse');
    } else if (restSeconds >= 240) { // 4 minutes
        restTimeElement.style.color = '#e67e22'; // Orange for approaching 5 minutes
    } else {
        restTimeElement.style.color = '#2c3e50'; // Default color
        completeSetBtn.classList.remove('pulse');
    }
    
    if (bestTime !== null) {
        bestTimeElement.textContent = formatTime(bestTime);
    } else {
        bestTimeElement.textContent = '--';
    }
}

// Update sensor display
function updateSensor() {
    // Update sensor data values
    accuracyValue.textContent = (sensorLevel - 2) + '%';
    precisionValue.textContent = (sensorLevel - 4) + '%';
    
    // Update depth bar based on sensor level
    const barHeight = isSensorEnabled ? (15 + (sensorLevel / 100) * 60) : 0;
    depthBar.style.height = barHeight + '%';
    
    // Update range value based on sensor level
    const range = isSensorEnabled ? (1.5 + (sensorLevel / 100) * 2.5) : 0;
    rangeValue.textContent = range.toFixed(1) + 'm';
    
    // Update sensor toggle button
    if (isSensorEnabled) {
        sensorToggleBtn.innerHTML = '<i class="fas fa-sensor-on"></i> Sensor: ON';
        sensorToggleBtn.classList.remove('off');
    } else {
        sensorToggleBtn.innerHTML = '<i class="fas fa-sensor-off"></i> Sensor: OFF';
        sensorToggleBtn.classList.add('off');
    }
}

// Show exercise feedback
function showFeedback(message, isWarning = false) {
    exerciseFeedback.textContent = message;
    exerciseFeedback.classList.remove('warning');
    
    if (isWarning) {
        exerciseFeedback.classList.add('warning');
    }
    
    exerciseFeedback.classList.add('visible');
    
    setTimeout(() => {
        exerciseFeedback.classList.remove('visible');
    }, 3000);
}

// Start rest timer counting up from 0
function startRestTimer() {
    clearInterval(restTimer);
    restSeconds = 0;
    updateDisplay();
    
    restTimer = setInterval(() => {
        if (!isWorkoutPaused && isWorkoutStarted) {
            restSeconds++;
            updateDisplay();
        }
    }, 1000);
}

// Start total timer
function startTotalTimer() {
    clearInterval(totalTimer);
    totalTimer = setInterval(() => {
        if (!isWorkoutPaused) {
            totalSeconds++;
            updateDisplay();
        }
    }, 1000);
}

// Stop all timers
function stopTimers() {
    clearInterval(restTimer);
    clearInterval(totalTimer);
}

// Complete a set
function completeSet() {
    if (!isWorkoutStarted) {
        showFeedback('Please start workout first!', true);
        return;
    }
    
    if (isWorkoutPaused) {
        showFeedback('Workout is paused!', true);
        return;
    }
    
    // Record this set time (actual rest taken)
    const actualRestTaken = restSeconds;
    setTimes.push(actualRestTaken);
    
    // Add the actual rest time to total rest time
    totalRestSeconds += actualRestTaken;
    
    setsCount++;
    
    // Calculate best time (shortest rest time)
    if (bestTime === null || actualRestTaken < bestTime) {
        bestTime = actualRestTaken;
        showFeedback('New best time! ' + formatTime(bestTime));
    } else {
        showFeedback('Set ' + setsCount + ' completed! Resting...');
    }
    
    startRestTimer();
    updateDisplay();
    
    // Add visual feedback to the button
    completeSetBtn.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
    setTimeout(() => {
        completeSetBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    }, 300);
}

// Add a set automatically via sensor
function addSetAutomatically() {
    if (!isWorkoutStarted || !isSensorEnabled || isWorkoutPaused) return;
    
    // Only count if at least 3 seconds have passed since last set
    if (restSeconds < 3 && setsCount > 0) {
        return;
    }
    
    completeSet();
}

// Toggle sensor on/off
function toggleSensor() {
    isSensorEnabled = !isSensorEnabled;
    updateSensor();
    
    if (isSensorEnabled) {
        showFeedback('Sensor enabled');
    } else {
        showFeedback('Sensor disabled');
    }
}

// Start workout
function startWorkout() {
    isWorkoutStarted = true;
    isWorkoutPaused = false;
    startTotalTimer();
    startRestTimer();
    startBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    
    showFeedback('Workout started! ' + (isSensorEnabled ? 'Sensor activated' : 'Manual mode'));
}

// Stop/pause workout
function stopWorkout() {
    isWorkoutPaused = !isWorkoutPaused;
    
    if (isWorkoutPaused) {
        stopBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        stopBtn.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        showFeedback('Workout paused');
    } else {
        stopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        stopBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        showFeedback('Workout resumed');
    }
    updateDisplay();
}

// Reset workout
function resetWorkout() {
    stopTimers();
    setsCount = 0;
    restSeconds = 0;
    totalSeconds = 0;
    totalRestSeconds = 0;
    bestTime = null;
    setTimes = [];
    isWorkoutStarted = false;
    isWorkoutPaused = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    startBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
    stopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    stopBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    updateDisplay();
    
    showFeedback('Workout reset. Ready to start again');
}

// Modal functions
function openModal(modal) {
    modal.style.display = 'flex';
}

function closeModals() {
    toolsModal.style.display = 'none';
    aboutModal.style.display = 'none';
    helpModal.style.display = 'none';
}

// Simulate sensor detecting exercises automatically
function simulateExerciseDetection() {
    setInterval(() => {
        if (isWorkoutStarted && isSensorEnabled && sensorLevel > 85 && !isWorkoutPaused) {
            // Higher chance of detection when sensor level is high
            const detectionChance = 0.5 + (sensorLevel - 85) / 100;
            
            if (Math.random() < detectionChance) {
                addSetAutomatically();
            }
        }
    }, 2000);
}

// Simulate sensor data changes
function simulateSensorData() {
    setInterval(() => {
        if (isSensorEnabled) {
            // Random sensor level between 85-99%
            sensorLevel = 85 + Math.floor(Math.random() * 15);
        } else {
            // Sensor not connected, level between 0-30%
            sensorLevel = Math.floor(Math.random() * 31);
        }
        
        updateSensor();
    }, 3000);
}

// Event Listeners
if (startBtn) startBtn.addEventListener('click', startWorkout);
if (stopBtn) stopBtn.addEventListener('click', stopWorkout);
if (completeSetBtn) completeSetBtn.addEventListener('click', completeSet);
if (resetBtn) resetBtn.addEventListener('click', resetWorkout);
if (sensorToggleBtn) sensorToggleBtn.addEventListener('click', toggleSensor);

// Navigation event listeners
if (toolsBtn) toolsBtn.addEventListener('click', () => openModal(toolsModal));
if (aboutBtn) aboutBtn.addEventListener('click', () => openModal(aboutModal));
if (helpBtn) helpBtn.addEventListener('click', () => openModal(helpModal));

// Close modal event listeners
closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModals);
});

// Close modal when clicking outside content
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});

// Initialize the application
if (completeSetBtn) {
    init();
    simulateExerciseDetection();
    simulateSensorData();
}
