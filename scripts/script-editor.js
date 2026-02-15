// ========================================
// ZENU - Script Editor Logic
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  if (typeof ZenuAuth !== "undefined") {
    ZenuAuth.requireAuth();
  }

  const editor = new ScriptEditor();
  editor.init();
});

class ScriptEditor {
  constructor() {
    // State
    this.currentScriptId = null;
    this.isDirty = false;
    this.autoSaveTimer = null;
    this.undoStack = [];

    // Templates
    this.templates = {
      morning: {
        title: "Morning Drive Show - [Date]",
        content:
          "[Intro Music Fade In]\n\nGood morning! It's [Time] on ZENU Radio. I'm [Host Name], and you're listening to the Morning Drive.\n\n[Pause - 2s]\n\nComing up this hour, we've got the latest on [News Topic 1], an exclusive interview with [Guest], and of course, your favorite tracks to get the day started.\n\n[Music Transition]\n\nFirst, let's look at the headlines...",
      },
      news: {
        title: "News Bulletin - [Time]",
        content:
          "[News Sting - Dramatic]\n\nThis is the ZENU News Bulletin. I'm [Name].\n\n[Pause]\n\nOur top story this hour: [Headline News Item]. [2-3 sentences of detail].\n\nIn other news: [Second News Item].\n\n[Third News Item].\n\nThat's the latest. I'm [Name], and you're listening to ZENU.",
      },
      talk: {
        title: "The Talk Table - [Topic]",
        content:
          "[Atmospheric Intro]\n\nWelcome to The Talk Table. Today, we're diving deep into [Topic]. Joining me is [Guest Name], expert in [Field].\n\n[Guest Name], welcome to the show.\n\nThanks for having me.\n\nLet's start with the big question: [Question 1]?\n\n[Interview details...]\n\nWe'll be right back after this break.",
      },
      promo: {
        title: "Promo: [Event/Show Name]",
        content:
          "[High Energy Bass Track]\n\nThis weekend... ZENU Radio brings you the biggest event of the year.\n\n[SFX: Crowd Cheer]\n\nJoin us at [Location] for [Event Name]. With performances by [Artist 1] and [Artist 2].\n\nGeneral admission starts at just [Price]. Tickets available now at [Website].\n\nDon't miss it. ZENU Radio - Feel the vibe.",
      },
    };

    // DOM Elements
    this.titleInput = document.getElementById("scriptTitle");
    this.contentArea = document.getElementById("scriptContent");
    this.saveStatus = document.getElementById("saveStatus");
    this.wordCountEl = document.getElementById("wordCount");
    this.readingTimeEl = document.getElementById("readingTime");
    this.aiPromptInput = document.getElementById("aiPrompt");
    this.recentScriptsList = document.getElementById("recentScriptsList");

    // Buttons
    this.saveBtn = document.getElementById("saveScriptBtn");
    this.aiImproveBtn = document.getElementById("aiGenerateBtn");
    this.aiSubmitBtn = document.getElementById("aiSubmitBtn");
    this.undoBtn = document.getElementById("undoBtn");
    this.launchPrompterBtn = document.getElementById("launchTeleprompterBtn");
    this.deleteBtn = document.getElementById("deleteScriptBtn");
  }

  async init() {
    this.setupEventListeners();

    // Check URL for ID or Template
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get("id");
    const templateName = urlParams.get("template");

    if (scriptId) {
      await this.loadScript(scriptId);
    } else if (templateName && this.templates[templateName]) {
      this.applyTemplate(templateName);
    } else {
      this.createNewScript();
    }

    this.loadRecentScripts();
    this.updateStats();
    this.updateDeleteButtonVisibility();
  }

  setupEventListeners() {
    // Content changes
    this.titleInput.addEventListener("input", () => this.markAsDirty());
    this.contentArea.addEventListener("input", () => {
      this.markAsDirty();
      this.updateStats();
    });

    // Save button
    this.saveBtn.addEventListener("click", () => this.saveScript());

    // AI Buttons
    this.aiImproveBtn.addEventListener("click", () => this.aiImprove());
    this.aiSubmitBtn.addEventListener("click", () => this.aiCustomPrompt());
    this.aiPromptInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.aiCustomPrompt();
    });

    // Undo button
    this.undoBtn.addEventListener("click", () => this.undo());

    // Template buttons
    document.querySelectorAll(".template-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const template = btn.getAttribute("data-template");
        if (
          this.isDirty &&
          !confirm("You have unsaved changes. Apply template anyway?")
        )
          return;
        this.applyTemplate(template);
      });
    });

    // Teleprompter
    this.launchPrompterBtn.addEventListener("click", () => {
      if (this.currentScriptId) {
        window.location.href = `teleprompter.html?id=${this.currentScriptId}`;
      } else {
        alert("Please save your script first before opening the teleprompter.");
      }
    });

    // Delete button
    this.deleteBtn.addEventListener("click", () => this.deleteScript());
  }

  markAsDirty() {
    this.isDirty = true;
    this.saveStatus.textContent = "Unsaved changes";
    this.saveStatus.style.color = "#f59e0b";

    // Reset auto-save timer
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.saveScript(true), 10000); // Auto-save after 10s
  }

  applyTemplate(name) {
    const template = this.templates[name];
    if (!template) return;

    this.titleInput.value = template.title;
    this.contentArea.value = template.content;
    this.isDirty = true;
    this.updateStats();
    this.saveStatus.textContent = "Template applied";
  }

  createNewScript() {
    this.titleInput.value = "";
    this.contentArea.value = "";
    this.currentScriptId = null;
    this.isDirty = false;
    this.saveStatus.textContent = "New Script";
    this.undoStack = [];
    this.updateUndoButtonVisibility();
    this.updateDeleteButtonVisibility();
  }

  async loadScript(id) {
    try {
      this.saveStatus.textContent = "Loading...";
      const script = await window.ZenuAPI.getScript(id);
      this.currentScriptId = script.id;
      this.titleInput.value = script.title;
      this.contentArea.value = script.content;
      this.isDirty = false;
      this.saveStatus.textContent = "All changes saved";
      this.saveStatus.style.color = "var(--medium-gray)";
      this.updateStats();
      this.undoStack = [];
      this.updateUndoButtonVisibility();
      this.updateDeleteButtonVisibility();
    } catch (error) {
      console.error("Failed to load script:", error);
      this.saveStatus.textContent = "Error loading script";
    }
  }

  async saveScript(isAutoSave = false) {
    if (!this.isDirty && this.currentScriptId) return;

    const title = this.titleInput.value || "Untitled Script";
    const content = this.contentArea.value;

    if (!content && !isAutoSave) {
      alert("Cannot save an empty script.");
      return;
    }

    try {
      this.saveStatus.textContent = isAutoSave ? "Auto-saving..." : "Saving...";

      let result;
      if (this.currentScriptId) {
        result = await window.ZenuAPI.updateScript(this.currentScriptId, {
          title,
          content,
        });
      } else {
        result = await window.ZenuAPI.createScript({ title, content });
        this.currentScriptId = result.id;
        // Update URL without refreshing
        const newUrl = `${window.location.pathname}?id=${result.id}`;
        window.history.pushState({ id: result.id }, "", newUrl);
      }

      this.isDirty = false;
      this.saveStatus.textContent = "All changes saved";
      this.saveStatus.style.color = "var(--medium-gray)";
      this.loadRecentScripts(); // Refresh sidebar
      this.updateDeleteButtonVisibility();
    } catch (error) {
      console.error("Save failed:", error);
      this.saveStatus.textContent = "Save failed";
      this.saveStatus.style.color = "#ef4444";
    }
  }

  async deleteScript() {
    if (!this.currentScriptId) {
      // If it's a new unsaved script, just clear it
      if (
        confirm("This script isn't saved. Do you want to clear the editor?")
      ) {
        this.createNewScript();
      }
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete "${this.titleInput.value || "this script"}"? This action cannot be undone.`,
      )
    ) {
      try {
        this.saveStatus.textContent = "Deleting...";
        await window.ZenuAPI.deleteScript(this.currentScriptId);
        // Redirect to dashboard or create new script
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("Delete failed:", error);
        this.saveStatus.textContent = "Delete failed";
        this.saveStatus.style.color = "#ef4444";
        alert("Failed to delete script. Please try again.");
      }
    }
  }

  async loadRecentScripts() {
    if (!this.recentScriptsList) return;

    try {
      const scripts = await window.ZenuAPI.getScripts();

      if (!scripts || scripts.length === 0) {
        this.recentScriptsList.innerHTML =
          '<p class="text-xs color-white p-2">No scripts yet</p>';
        return;
      }

      this.recentScriptsList.innerHTML = scripts
        .slice(0, 10)
        .map(
          (script) => `
                <div class="recent-script-item" onclick="window.location.href='script-editor.html?id=${script.id}'">
                    <div class="recent-script-title">${script.title || "Untitled"}</div>
                    <div class="recent-script-date">${this.formatDate(script.createdAt)}</div>
                </div>
            `,
        )
        .join("");
    } catch (error) {
      this.recentScriptsList.innerHTML =
        '<p class="text-xs color-danger p-2">Error loading scripts</p>';
    }
  }

  async aiImprove() {
    const content = this.contentArea.value;
    if (!content) return alert("Add some content first!");

    try {
      const originalBtnText = this.aiImproveBtn.innerHTML;
      this.aiImproveBtn.innerHTML = "Improving...";
      this.aiImproveBtn.disabled = true;

      // Save for undo
      this.saveToUndo();

      // Get user profile for catchphrase and name
      const userProfile = JSON.parse(
        localStorage.getItem("zenuUserProfile") || "{}",
      );

      const result = await window.ZenuAPI.generateScript(
        null,
        `Improve this radio script, make it more engaging and professional:\n\n${content}`,
        {
          hostName: userProfile.fullName,
          startCatchphrase: userProfile.startCatchphrase,
          endCatchphrase: userProfile.endCatchphrase,
          catchphrasePosition: userProfile.catchphrasePosition,
        },
      );

      this.contentArea.value = result.content;
      this.markAsDirty();
      this.updateStats();

      this.aiImproveBtn.innerHTML = originalBtnText;
      this.aiImproveBtn.disabled = false;
    } catch (error) {
      console.error("AI error:", error);
      alert("AI generation failed. Please try again.");
      this.aiImproveBtn.innerHTML = "AI Improve";
      this.aiImproveBtn.disabled = false;
    }
  }

  async aiCustomPrompt() {
    const prompt = this.aiPromptInput.value;
    const currentContent = this.contentArea.value;
    if (!prompt) return;

    try {
      this.aiSubmitBtn.textContent = "...";
      this.aiSubmitBtn.disabled = true;

      // Save for undo
      this.saveToUndo();

      const finalPrompt = currentContent
        ? `Current script: ${currentContent}\n\nTask: ${prompt}`
        : prompt;

      // Get user profile for catchphrase and name
      const userProfile = JSON.parse(
        localStorage.getItem("zenuUserProfile") || "{}",
      );

      const result = await window.ZenuAPI.generateScript(null, finalPrompt, {
        hostName: userProfile.fullName,
        startCatchphrase: userProfile.startCatchphrase,
        endCatchphrase: userProfile.endCatchphrase,
        catchphrasePosition: userProfile.catchphrasePosition,
      });

      this.contentArea.value = result.content;
      this.aiPromptInput.value = "";
      this.markAsDirty();
      this.updateStats();

      this.aiSubmitBtn.textContent = "Submit";
      this.aiSubmitBtn.disabled = false;
    } catch (error) {
      console.error("AI error:", error);
      this.aiSubmitBtn.textContent = "Submit";
      this.aiSubmitBtn.disabled = false;
    }
  }

  saveToUndo() {
    this.undoStack.push({
      title: this.titleInput.value,
      content: this.contentArea.value,
    });
    // Keep only last 10 undos
    if (this.undoStack.length > 10) this.undoStack.shift();
    this.updateUndoButtonVisibility();
  }

  undo() {
    if (this.undoStack.length === 0) return;

    const previousState = this.undoStack.pop();
    this.titleInput.value = previousState.title;
    this.contentArea.value = previousState.content;

    this.markAsDirty();
    this.updateStats();
    this.updateUndoButtonVisibility();
    this.saveStatus.textContent = "Undo applied";
  }

  updateUndoButtonVisibility() {
    if (this.undoBtn) {
      this.undoBtn.style.display = this.undoStack.length > 0 ? "flex" : "none";
    }
  }

  updateDeleteButtonVisibility() {
    if (this.deleteBtn) {
      // Show delete button only if script exists OR if it's a new unsaved script with content
      const hasContent = this.titleInput.value || this.contentArea.value;
      this.deleteBtn.style.display =
        this.currentScriptId || hasContent ? "flex" : "none";
    }
  }

  updateStats() {
    const text = this.contentArea.value || "";
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    this.wordCountEl.textContent = `${words} words`;

    // Average speaking speed is 130 words per minute
    const minutes = Math.floor(words / 130);
    const seconds = Math.floor((words % 130) / (130 / 60));
    this.readingTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")} estimated reading time`;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
}
