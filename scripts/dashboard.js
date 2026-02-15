// ========================================
// ZENU - Dashboard Script
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  if (typeof ZenuAuth !== "undefined") {
    ZenuAuth.requireAuth();
  }

  // Initialize dashboard
  initDashboard();
  loadScripts();
  loadActivity();
  updateStats();

  // Selection state
  window.selectedScriptIds = new Set();
  window.currentScriptIds = []; // Track IDs of currently displayed scripts
});

// Initialize dashboard
function initDashboard() {
  const profile = ZenuAuth?.getUserProfile();

  if (profile) {
    // Update welcome message
    const userName = document.querySelector("[data-user-name]");
    const showName = document.querySelector("[data-show-name]");

    if (userName) userName.textContent = profile.fullName || "User";
    if (showName) showName.textContent = profile.showName || "your show";
  }
}

// Load scripts
// Load scripts
async function loadScripts() {
  const scriptsList = document.getElementById("scriptsList");
  if (!scriptsList) return;

  try {
    const scripts = await window.ZenuAPI.getScripts();
    const listControls = document.getElementById("listControls");

    if (!scripts || scripts.length === 0) {
      if (listControls) listControls.style.display = "none";
      // Show empty state
      scriptsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg></div>
                    <p>No scripts yet. Create your first one!</p>
                    <a href="script-editor.html" class="btn btn-primary">Create Script</a>
                </div>
            `;
      return;
    }

    // Display latest 5 scripts
    const displayedScripts = scripts.slice(0, 5);
    window.currentScriptIds = displayedScripts.map((s) => s.id);

    if (listControls) listControls.style.display = "flex";

    scriptsList.innerHTML = displayedScripts
      .map(
        (script) => `
            <div class="script-item ${window.selectedScriptIds?.has(script.id) ? "selected" : ""}" id="script-row-${script.id}" onclick="toggleScriptSelection(event, '${script.id}')">
                <div class="script-checkbox-wrapper">
                    <input type="checkbox" class="script-checkbox" 
                        ${window.selectedScriptIds?.has(script.id) ? "checked" : ""} 
                        onclick="event.stopPropagation(); toggleScriptSelection(null, '${script.id}')"
                        id="checkbox-${script.id}">
                </div>
                <div class="script-content-main">
                    <div class="script-header">
                        <h3 class="script-title" onclick="event.stopPropagation(); openScript('${script.id}')">${script.title}</h3>
                        <div class="script-actions">
                            <span class="script-badge">${script.voiceId || "Manual"}</span>
                            <button class="btn-delete" onclick="event.stopPropagation(); confirmDelete('${script.id}', '${script.title.replace(/'/g, "\\'")}')" aria-label="Delete script">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="script-meta">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M8 4V8L11 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            ${formatDate(script.createdAt)}
                        </span>
                        <span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6H12M4 8H12M4 10H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            ${(script.content || "").split(/\s+/).filter((w) => w).length} words
                        </span>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
    updateBulkActionsUI();
  } catch (error) {
    console.error("Error loading scripts:", error);
    scriptsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>Error loading scripts. Please check your connection.</p>
            </div>
        `;
  }
}

// Load activity feed
function loadActivity() {
  const activityFeed = document.getElementById("activityFeed");
  if (!activityFeed) return;

  const activities = [
    {
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7 10l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      text: "Profile setup completed",
      time: "Just now",
    },
    {
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>',
      text: "Welcome to ZENU!",
      time: "Just now",
    },
  ];

  // Get activities from localStorage
  const savedActivities = localStorage.getItem("zenuActivities");
  if (savedActivities) {
    const localActivities = JSON.parse(savedActivities);
    activities.unshift(...localActivities);
  }

  activityFeed.innerHTML = activities
    .slice(0, 5)
    .map(
      (activity) => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `,
    )
    .join("");
}

// Update stats
async function updateStats() {
  try {
    const scripts = await window.ZenuAPI.getScripts();
    const articles = await window.ZenuAPI.getArticles();

    const totalScriptsEl = document.getElementById("totalScripts");
    const thisWeekEl = document.getElementById("thisWeek");
    const newsItemsEl = document.getElementById("newsItems");

    if (totalScriptsEl) {
      animateCounter(totalScriptsEl, scripts.length);
    }

    // Count scripts from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekScripts = scripts.filter((script) => {
      const scriptDate = new Date(script.createdAt);
      return scriptDate > oneWeekAgo;
    });

    if (thisWeekEl) {
      animateCounter(thisWeekEl, thisWeekScripts.length);
    }

    if (newsItemsEl) {
      animateCounter(newsItemsEl, articles.length);
    }
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

// Animate counter
function animateCounter(element, target, duration = 1000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;

    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Open script
function openScript(scriptId) {
  window.location.href = `script-editor.html?id=${scriptId}`;
}

// Confirm delete
function confirmDelete(scriptId, scriptTitle) {
  if (confirm(`Are you sure you want to delete "${scriptTitle}"?`)) {
    deleteScript(scriptId);
  }
}

// Delete script
async function deleteScript(scriptId) {
  try {
    const response = await window.ZenuAPI.deleteScript(scriptId);
    if (response) {
      // Reload scripts and update stats
      await loadScripts();
      await updateStats();
      addActivity("🗑️", `Deleted script: ${scriptId}`);
    }
  } catch (error) {
    console.error("Error deleting script:", error);
    alert("Failed to delete script. Please try again.");
  }
}

// Toggle selection
function toggleScriptSelection(event, scriptId) {
  if (!window.selectedScriptIds) window.selectedScriptIds = new Set();

  const row = document.getElementById(`script-row-${scriptId}`);
  const checkbox = document.getElementById(`checkbox-${scriptId}`);

  if (window.selectedScriptIds.has(scriptId)) {
    window.selectedScriptIds.delete(scriptId);
    if (row) row.classList.remove("selected");
    if (checkbox) checkbox.checked = false;
  } else {
    window.selectedScriptIds.add(scriptId);
    if (row) row.classList.add("selected");
    if (checkbox) checkbox.checked = true;
  }

  updateBulkActionsUI();
}

// Toggle Select All
function toggleSelectAll(checkbox) {
  const isChecked = checkbox.checked;
  const ids = window.currentScriptIds || [];

  if (isChecked) {
    ids.forEach((id) => window.selectedScriptIds.add(id));
  } else {
    ids.forEach((id) => window.selectedScriptIds.delete(id));
  }

  // Update UI for all rows
  ids.forEach((id) => {
    const row = document.getElementById(`script-row-${id}`);
    const rowCheckbox = document.getElementById(`checkbox-${id}`);
    if (row) {
      isChecked
        ? row.classList.add("selected")
        : row.classList.remove("selected");
    }
    if (rowCheckbox) rowCheckbox.checked = isChecked;
  });

  updateBulkActionsUI();
}

// Update Bulk Actions UI
function updateBulkActionsUI() {
  const bulkActions = document.getElementById("bulkActions");
  const countLabel = document.getElementById("selectionCount");
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const count = window.selectedScriptIds?.size || 0;
  const totalInView = window.currentScriptIds?.length || 0;

  if (bulkActions) {
    bulkActions.style.display = count > 0 ? "flex" : "none";
  }
  if (countLabel) {
    countLabel.textContent = `${count} selected`;
  }

  // Sync Select All checkbox
  if (selectAllCheckbox) {
    if (count === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (count >= totalInView && totalInView > 0) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }
}

// Bulk delete
async function deleteSelectedScripts() {
  const count = window.selectedScriptIds.size;
  if (!count) return;

  if (confirm(`Are you sure you want to delete ${count} selected scripts?`)) {
    try {
      const idsToDelete = Array.from(window.selectedScriptIds);
      let successCount = 0;

      for (const id of idsToDelete) {
        try {
          await window.ZenuAPI.deleteScript(id);
          successCount++;
        } catch (e) {
          console.error(`Failed to delete script ${id}`, e);
        }
      }

      window.selectedScriptIds.clear();
      await loadScripts();
      await updateStats();
      addActivity("🗑️", `Bulk deleted ${successCount} scripts`);

      if (successCount < count) {
        alert(`Deleted ${successCount} out of ${count} scripts. Some failed.`);
      }
    } catch (error) {
      console.error("Error during bulk delete:", error);
      alert("An error occurred during bulk deletion.");
    }
  }
}

// Add activity
function addActivity(icon, text) {
  const activities = JSON.parse(localStorage.getItem("zenuActivities") || "[]");

  activities.unshift({
    icon,
    text,
    time: "Just now",
    timestamp: new Date().toISOString(),
  });

  // Keep only last 20 activities
  if (activities.length > 20) {
    activities.pop();
  }

  localStorage.setItem("zenuActivities", JSON.stringify(activities));
  loadActivity();
}

// Export function for use in other scripts
window.DashboardUtils = {
  addActivity,
  updateStats,
  loadScripts,
};
