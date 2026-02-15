document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const selectionView = document.getElementById("selection-view");
  const prompterView = document.getElementById("prompter-view");
  const scriptsList = document.getElementById("scripts-list");
  const quickPaste = document.getElementById("quick-paste");
  const startPasteBtn = document.getElementById("start-paste-btn");
  const prompterText = document.getElementById("prompter-text");
  const activeScriptTitle = document.getElementById("active-script-title");

  // Controls
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playIcon = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  const restartBtn = document.getElementById("restart-btn");
  const exitBtn = document.getElementById("exit-prompter");
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");

  // Settings
  const speedControl = document.getElementById("speed-control");
  const speedValue = document.getElementById("speed-value");
  const fontControl = document.getElementById("font-control");
  const fontValue = document.getElementById("font-value");
  const mirrorControl = document.getElementById("mirror-control");
  const flipControl = document.getElementById("flip-control");
  const progressBar = document.getElementById("prompter-progress");

  // State
  let isPlaying = false;
  let scrollPosition = 0;
  let currentScripts = [];
  let scrollSpeed = 5;
  let animationId = null;

  const API_BASE = "http://127.0.0.1:3001/api";

  // --- Initial Load ---
  loadSettings();
  fetchScripts();

  // --- Event Listeners ---
  startPasteBtn.addEventListener("click", () => {
    const text = quickPaste.value.trim();
    if (text) {
      startPrompter(text, "Quick Script");
    } else {
      alert("Please paste some text first.");
    }
  });

  playPauseBtn.addEventListener("click", togglePlay);
  restartBtn.addEventListener("click", restartPrompter);
  exitBtn.addEventListener("click", exitPrompter);

  settingsToggle.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
  });

  speedControl.addEventListener("input", (e) => {
    scrollSpeed = parseInt(e.target.value);
    speedValue.textContent = scrollSpeed;
    saveSettings();
  });

  fontControl.addEventListener("input", (e) => {
    const size = e.target.value;
    prompterText.style.fontSize = `${size}px`;
    fontValue.textContent = size;
    saveSettings();
  });

  mirrorControl.addEventListener("change", (e) => {
    if (e.target.checked) prompterText.classList.add("mirror-h");
    else prompterText.classList.remove("mirror-h");
    saveSettings();
  });

  flipControl.addEventListener("change", (e) => {
    if (e.target.checked) prompterText.classList.add("flip-v");
    else prompterText.classList.remove("flip-v");
    saveSettings();
  });

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    if (prompterView.classList.contains("hidden")) return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowUp") {
      scrollSpeed = Math.min(20, scrollSpeed + 1);
      updateSpeedUI();
    } else if (e.code === "ArrowDown") {
      scrollSpeed = Math.max(1, scrollSpeed - 1);
      updateSpeedUI();
    } else if (e.code === "Escape") {
      exitPrompter();
    }
  });

  // --- Functions ---

  async function fetchScripts() {
    try {
      const response = await fetch(`${API_BASE}/scripts`);
      const scripts = await response.json();
      currentScripts = scripts;
      renderScriptsList(scripts);

      // Auto-load if ID provided in URL
      const urlParams = new URLSearchParams(window.location.search);
      const scriptId = urlParams.get("id");
      if (scriptId) {
        const script = scripts.find((s) => s.id === scriptId);
        if (script) {
          startPrompter(script.content, script.title);
        }
      }
    } catch (error) {
      console.error("Error fetching scripts:", error);
      scriptsList.innerHTML =
        '<p class="text-error">Failed to load scripts.</p>';
    }
  }

  function renderScriptsList(scripts) {
    if (scripts.length === 0) {
      scriptsList.innerHTML =
        '<p class="text-center" style="padding: 1rem; color: var(--medium-gray);">No scripts found. Use the Curator or Editor to create one.</p>';
      return;
    }

    scriptsList.innerHTML = scripts
      .map(
        (script) => `
            <div class="script-item" data-id="${script.id}">
                <div class="script-info">
                    <h4>${script.title}</h4>
                    <p>${new Date(script.createdAt).toLocaleDateString()} • ${Math.round(script.content.length / 15)} words</p>
                </div>
                <button class="btn btn-primary btn-sm start-script" data-id="${script.id}">Start</button>
            </div>
        `,
      )
      .join("");

    // Add event listeners to new buttons
    document.querySelectorAll(".start-script").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const script = currentScripts.find((s) => s.id === id);
        if (script) startPrompter(script.content, script.title);
      });
    });
  }

  function startPrompter(text, title) {
    prompterText.innerText = text;
    activeScriptTitle.innerText = title;

    selectionView.classList.add("hidden");
    document.getElementById("navbar").classList.add("hidden");
    prompterView.classList.remove("hidden");

    // Reset state
    scrollPosition = 0;
    prompterText.style.transform = `translateY(0)`;
    updateProgress();
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
      requestAnimationFrame(scrollLoop);
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
      cancelAnimationFrame(animationId);
    }
  }

  function scrollLoop() {
    if (!isPlaying) return;

    scrollPosition -= (scrollSpeed / 10) * 2; // Adjust multiplier for smoothness
    prompterText.style.transform = `translateY(${scrollPosition}px)`;

    updateProgress();

    // Check if finished
    const textHeight = prompterText.offsetHeight;
    const containerHeight = prompterView.offsetHeight;

    if (Math.abs(scrollPosition) > textHeight + containerHeight / 2) {
      togglePlay(); // Stop when reached the end
    } else {
      animationId = requestAnimationFrame(scrollLoop);
    }
  }

  function updateProgress() {
    const textHeight = prompterText.offsetHeight;
    const totalScroll = textHeight;
    const progress = Math.min(
      100,
      Math.max(0, (Math.abs(scrollPosition) / totalScroll) * 100),
    );
    progressBar.style.width = `${progress}%`;
  }

  function restartPrompter() {
    isPlaying = false;
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
    cancelAnimationFrame(animationId);
    scrollPosition = 0;
    prompterText.style.transform = `translateY(0)`;
    updateProgress();
  }

  function exitPrompter() {
    restartPrompter();
    prompterView.classList.add("hidden");
    selectionView.classList.remove("hidden");
    document.getElementById("navbar").classList.remove("hidden");
    settingsPanel.classList.add("hidden");
  }

  function updateSpeedUI() {
    speedControl.value = scrollSpeed;
    speedValue.textContent = scrollSpeed;
    saveSettings();
  }

  function saveSettings() {
    const settings = {
      scrollSpeed,
      fontSize: fontControl.value,
      mirror: mirrorControl.checked,
      flip: flipControl.checked,
    };
    localStorage.setItem("zenuPrompterSettings", JSON.stringify(settings));
  }

  function loadSettings() {
    // Set defaults first
    scrollSpeed = 5;
    const defaultFontSize = 60;

    speedControl.value = scrollSpeed;
    speedValue.textContent = scrollSpeed;
    fontControl.value = defaultFontSize;
    fontValue.textContent = defaultFontSize;
    prompterText.style.fontSize = `${defaultFontSize}px`;

    const saved = localStorage.getItem("zenuPrompterSettings");
    if (!saved) return;

    try {
      const settings = JSON.parse(saved);
      scrollSpeed = settings.scrollSpeed || 5;
      speedControl.value = scrollSpeed;
      speedValue.textContent = scrollSpeed;

      const fontSize = settings.fontSize || 48;
      fontControl.value = fontSize;
      fontValue.textContent = fontSize;
      prompterText.style.fontSize = `${fontSize}px`;

      mirrorControl.checked = settings.mirror || false;
      if (mirrorControl.checked) prompterText.classList.add("mirror-h");

      flipControl.checked = settings.flip || false;
      if (flipControl.checked) prompterText.classList.add("flip-v");
    } catch (e) {
      console.error("Error loading settings:", e);
    }
  }
});
