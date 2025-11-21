// ==================== TELEPROMPTER CONTROLS ====================

const { API_BASE_URL, getToken, showError } = window.ZenuAuth;

// ==================== STATE ====================
let currentScript = null;
let isScrolling = false;
let scrollSpeed = 50; // pixels per second
let scrollInterval = null;
let currentChunkIndex = 0;
let fontSize = 'medium'; // small, medium, large, xlarge
let isMirrorMode = false;
let isFullscreen = false;
let showNotes = false;
let startTime = null;
let timerInterval = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!window.ZenuAuth.requireAuth()) return;
  
  // Get script ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const scriptId = urlParams.get('scriptId');
  
  if (!scriptId) {
    showError('No script ID provided');
    setTimeout(() => window.location.href = '/dashboard', 2000);
    return;
  }
  
  // Load script
  await loadScript(scriptId);
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Initialize controls
  updateSpeedDisplay();
  updateFontSizeClass();
});

// ==================== LOAD SCRIPT ====================
async function loadScript(scriptId) {
  try {
    showLoading();
    
    const response = await fetch(`${API_BASE_URL}/skills/script/${scriptId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load script');
    }
    
    currentScript = data.data;
    
    // Display script
    displayScript();
    
    hideLoading();
    
  } catch (error) {
    console.error('Load script error:', error);
    showError(error.message);
    hideLoading();
  }
}

// ==================== DISPLAY SCRIPT ====================
function displayScript() {
  const container = document.getElementById('script-content');
  if (!container || !currentScript) return;
  
  const chunks = currentScript.teleprompterScript?.chunks || [];
  
  if (chunks.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted);">No script content available</p>';
    return;
  }
  
  // Group chunks by section
  let html = '';
  let currentSection = '';
  
  chunks.forEach((chunk, index) => {
    // Add section header if section changes
    if (chunk.sectionType && chunk.sectionType !== currentSection && chunk.sectionType !== 'break') {
      currentSection = chunk.sectionType;
      html += `<div class="script-section-header">${formatSectionName(currentSection)}</div>`;
    }
    
    // Skip break chunks
    if (chunk.sectionType === 'break') return;
    
    // Add chunk
    const classes = ['script-chunk'];
    if (index === currentChunkIndex) classes.push('active');
    if (chunk.emphasis) classes.push('emphasis');
    if (chunk.pause > 0) classes.push('pause');
    
    html += `
      <div class="${classes.join(' ')}" data-index="${index}" data-pause="${chunk.pause || 0}">
        ${chunk.text}
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Scroll to active chunk
  scrollToActiveChunk();
}

// ==================== PLAYBACK CONTROLS ====================
function togglePlayPause() {
  if (isScrolling) {
    pauseScroll();
  } else {
    startScroll();
  }
}

function startScroll() {
  if (isScrolling) return;
  
  isScrolling = true;
  updatePlayButton();
  
  // Start timer
  if (!startTime) {
    startTime = Date.now();
    startTimer();
  }
  
  // Auto-scroll
  scrollInterval = setInterval(() => {
    autoScroll();
  }, 50); // Update every 50ms for smooth scrolling
}

function pauseScroll() {
  if (!isScrolling) return;
  
  isScrolling = false;
  updatePlayButton();
  
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function stopScroll() {
  pauseScroll();
  
  // Reset to beginning
  currentChunkIndex = 0;
  displayScript();
  
  // Reset timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  startTime = null;
  updateTimerDisplay(0);
}

function autoScroll() {
  const container = document.getElementById('teleprompter-script');
  if (!container) return;
  
  // Scroll by speed
  const scrollAmount = (scrollSpeed / 20); // Adjust for 50ms interval
  container.scrollTop += scrollAmount;
  
  // Update active chunk based on scroll position
  updateActiveChunk();
}

function updateActiveChunk() {
  const chunks = document.querySelectorAll('.script-chunk');
  const container = document.getElementById('teleprompter-script');
  
  if (!chunks.length || !container) return;
  
  const containerRect = container.getBoundingClientRect();
  const centerY = containerRect.top + (containerRect.height / 2);
  
  chunks.forEach((chunk, index) => {
    const rect = chunk.getBoundingClientRect();
    const chunkCenterY = rect.top + (rect.height / 2);
    
    // Check if chunk is near center
    if (Math.abs(chunkCenterY - centerY) < 100) {
      if (index !== currentChunkIndex) {
        currentChunkIndex = index;
        
        // Update active class
        chunks.forEach(c => c.classList.remove('active'));
        chunk.classList.add('active');
        
        // Handle pause
        const pauseDuration = parseInt(chunk.dataset.pause) || 0;
        if (pauseDuration > 0 && isScrolling) {
          pauseScroll();
          setTimeout(() => {
            if (!isScrolling) startScroll();
          }, pauseDuration);
        }
        
        // Update notes
        updateSpeakerNotes(chunk);
      }
    }
  });
}

function scrollToActiveChunk() {
  const activeChunk = document.querySelector('.script-chunk.active');
  if (activeChunk) {
    activeChunk.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ==================== SPEED CONTROL ====================
function adjustSpeed(delta) {
  scrollSpeed = Math.max(10, Math.min(200, scrollSpeed + delta));
  updateSpeedDisplay();
}

function setSpeed(value) {
  scrollSpeed = parseInt(value);
  updateSpeedDisplay();
}

function updateSpeedDisplay() {
  const speedValue = document.getElementById('speed-value');
  const speedSlider = document.getElementById('speed-slider');
  
  if (speedValue) speedValue.textContent = scrollSpeed;
  if (speedSlider) speedSlider.value = scrollSpeed;
}

// ==================== FONT SIZE CONTROL ====================
function increaseFontSize() {
  const sizes = ['small', 'medium', 'large', 'xlarge'];
  const currentIndex = sizes.indexOf(fontSize);
  if (currentIndex < sizes.length - 1) {
    fontSize = sizes[currentIndex + 1];
    updateFontSizeClass();
  }
}

function decreaseFontSize() {
  const sizes = ['small', 'medium', 'large', 'xlarge'];
  const currentIndex = sizes.indexOf(fontSize);
  if (currentIndex > 0) {
    fontSize = sizes[currentIndex - 1];
    updateFontSizeClass();
  }
}

function updateFontSizeClass() {
  const container = document.getElementById('teleprompter-container');
  if (!container) return;
  
  container.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
  container.classList.add(`font-${fontSize}`);
}

// ==================== DISPLAY MODES ====================
function toggleMirror() {
  isMirrorMode = !isMirrorMode;
  const scriptEl = document.getElementById('teleprompter-script');
  
  if (scriptEl) {
    scriptEl.classList.toggle('mirror', isMirrorMode);
  }
  
  updateMirrorButton();
}

function toggleFullscreen() {
  const container = document.getElementById('teleprompter-container');
  if (!container) return;
  
  if (!isFullscreen) {
    // Enter fullscreen
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
    isFullscreen = true;
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    isFullscreen = false;
  }
  
  updateFullscreenButton();
}

function toggleNotes() {
  showNotes = !showNotes;
  const notesPanel = document.getElementById('speaker-notes');
  
  if (notesPanel) {
    notesPanel.classList.toggle('visible', showNotes);
  }
  
  updateNotesButton();
}

function toggleHighContrast() {
  const container = document.getElementById('teleprompter-container');
  if (container) {
    container.classList.toggle('high-contrast');
  }
}

// ==================== SPEAKER NOTES ====================
function updateSpeakerNotes(chunk) {
  if (!showNotes) return;
  
  const notesContent = document.getElementById('notes-content');
  if (!notesContent) return;
  
  const notes = chunk.dataset.notes || chunk.querySelector('[data-notes]')?.dataset.notes;
  
  if (notes) {
    notesContent.textContent = notes;
  } else {
    notesContent.textContent = 'No notes for this section';
  }
}

// ==================== TIMER ====================
function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    updateTimerDisplay(elapsed);
  }, 1000);
}

function updateTimerDisplay(elapsed) {
  const timerEl = document.getElementById('timer-display');
  if (!timerEl) return;
  
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// ==================== PROGRESS BAR ====================
function updateProgress() {
  const progressBar = document.getElementById('teleprompter-progress');
  const container = document.getElementById('teleprompter-script');
  
  if (!progressBar || !container) return;
  
  const scrollPercentage = (container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100;
  progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercentage))}%`;
}

// ==================== UI UPDATES ====================
function updatePlayButton() {
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.innerHTML = isScrolling ? '⏸' : '▶';
    playBtn.classList.toggle('active', isScrolling);
  }
}

function updateMirrorButton() {
  const mirrorBtn = document.getElementById('mirror-btn');
  if (mirrorBtn) {
    mirrorBtn.classList.toggle('active', isMirrorMode);
  }
}

function updateFullscreenButton() {
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.classList.toggle('active', isFullscreen);
  }
}

function updateNotesButton() {
  const notesBtn = document.getElementById('notes-btn');
  if (notesBtn) {
    notesBtn.classList.toggle('active', showNotes);
  }
}

// ==================== KEYBOARD SHORTCUTS ====================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlayPause();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        adjustSpeed(10);
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        adjustSpeed(-10);
        break;
      
      case 'ArrowRight':
        e.preventDefault();
        if (currentChunkIndex < document.querySelectorAll('.script-chunk').length - 1) {
          currentChunkIndex++;
          displayScript();
        }
        break;
      
      case 'ArrowLeft':
        e.preventDefault();
        if (currentChunkIndex > 0) {
          currentChunkIndex--;
          displayScript();
        }
        break;
      
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMirror();
        break;
      
      case 'n':
      case 'N':
        e.preventDefault();
        toggleNotes();
        break;
      
      case 'r':
      case 'R':
        e.preventDefault();
        stopScroll();
        break;
      
      case '+':
      case '=':
        e.preventDefault();
        increaseFontSize();
        break;
      
      case '-':
      case '_':
        e.preventDefault();
        decreaseFontSize();
        break;
      
      case '?':
        e.preventDefault();
        toggleShortcutsOverlay();
        break;
      
      case 'Escape':
        e.preventDefault();
        if (isFullscreen) toggleFullscreen();
        hideShortcutsOverlay();
        break;
    }
  });
}

// ==================== SHORTCUTS OVERLAY ====================
function toggleShortcutsOverlay() {
  const overlay = document.getElementById('shortcuts-overlay');
  if (overlay) {
    overlay.classList.toggle('visible');
  }
}

function hideShortcutsOverlay() {
  const overlay = document.getElementById('shortcuts-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Play/Pause
  const playBtn = document.getElementById('play-btn');
  if (playBtn) playBtn.addEventListener('click', togglePlayPause);
  
  // Stop
  const stopBtn = document.getElementById('stop-btn');
  if (stopBtn) stopBtn.addEventListener('click', stopScroll);
  
  // Speed slider
  const speedSlider = document.getElementById('speed-slider');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => setSpeed(e.target.value));
  }
  
  // Font size
  const fontIncBtn = document.getElementById('font-increase-btn');
  const fontDecBtn = document.getElementById('font-decrease-btn');
  if (fontIncBtn) fontIncBtn.addEventListener('click', increaseFontSize);
  if (fontDecBtn) fontDecBtn.addEventListener('click', decreaseFontSize);
  
  // Mirror
  const mirrorBtn = document.getElementById('mirror-btn');
  if (mirrorBtn) mirrorBtn.addEventListener('click', toggleMirror);
  
  // Fullscreen
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
  
  // Notes
  const notesBtn = document.getElementById('notes-btn');
  if (notesBtn) notesBtn.addEventListener('click', toggleNotes);
  
  // High contrast
  const contrastBtn = document.getElementById('contrast-btn');
  if (contrastBtn) contrastBtn.addEventListener('click', toggleHighContrast);
  
  // Back to dashboard
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', () => window.location.href = '/dashboard');
  
  // Scroll progress
  const container = document.getElementById('teleprompter-script');
  if (container) {
    container.addEventListener('scroll', updateProgress);
  }
  
  // Fullscreen change
  document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    updateFullscreenButton();
  });
}

// ==================== HELPER FUNCTIONS ====================
function formatSectionName(section) {
  return section
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function showLoading() {
  const loader = document.getElementById('teleprompter-loading');
  if (loader) loader.style.display = 'flex';
}

function hideLoading() {
  const loader = document.getElementById('teleprompter-loading');
  if (loader) loader.style.display = 'none';
}

// ==================== EXPORT ====================
window.ZenuTeleprompter = {
  loadScript,
  togglePlayPause,
  startScroll,
  pauseScroll,
  stopScroll,
  adjustSpeed,
  toggleMirror,
  toggleFullscreen,
  toggleNotes
};
