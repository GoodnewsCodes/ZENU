// ========================================
// ZENU - Onboarding Script
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  let currentStep = 1;
  const totalSteps = 3;
  let formData = {};

  // Elements
  const progressFill = document.getElementById("progressFill");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const completeBtn = document.getElementById("completeBtn");
  const formSteps = document.querySelectorAll(".form-step");
  const progressSteps = document.querySelectorAll(".progress-step");

  // Initialize
  updateProgress();

  // Next button
  nextBtn.addEventListener("click", function () {
    if (validateStep(currentStep)) {
      saveStepData(currentStep);
      currentStep++;
      updateProgress();
      updateButtons();
    }
  });

  // Previous button
  prevBtn.addEventListener("click", function () {
    currentStep--;
    updateProgress();
    updateButtons();
  });

  // Update progress
  function updateProgress() {
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = progress + "%";

    // Update step indicators
    progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;

      if (stepNumber < currentStep) {
        step.classList.add("completed");
        step.classList.remove("active");
      } else if (stepNumber === currentStep) {
        step.classList.add("active");
        step.classList.remove("completed");
      } else {
        step.classList.remove("active", "completed");
      }
    });

    // Update form steps
    formSteps.forEach((step, index) => {
      if (index + 1 === currentStep) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });
  }

  // Update buttons
  function updateButtons() {
    // Previous button
    if (currentStep === 1) {
      prevBtn.style.display = "none";
    } else {
      prevBtn.style.display = "inline-flex";
    }

    // Next/Complete button
    if (currentStep === totalSteps) {
      nextBtn.style.display = "none";
      completeBtn.style.display = "inline-flex";
    } else {
      nextBtn.style.display = "inline-flex";
      completeBtn.style.display = "none";
    }
  }

  // Validate step
  function validateStep(step) {
    const currentStepElement = document.querySelector(
      `.form-step[data-step="${step}"]`,
    );
    if (!currentStepElement) return true;

    const requiredInputs = currentStepElement.querySelectorAll("[required]");
    let isValid = true;

    requiredInputs.forEach((input) => {
      if (input.type === "radio") {
        const radioGroup = currentStepElement.querySelectorAll(
          `[name="${input.name}"]`,
        );
        const isChecked = Array.from(radioGroup).some((radio) => radio.checked);

        if (!isChecked) {
          isValid = false;
          showError("Please select an option");
        }
      } else if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = "var(--primary-color)";
        showError("Please fill in all required fields");
      } else {
        input.style.borderColor = "";
      }
    });

    return isValid;
  }

  // Save step data
  function saveStepData(step) {
    const currentStepElement = document.querySelector(
      `.form-step[data-step="${step}"]`,
    );
    if (!currentStepElement) return;

    switch (step) {
      case 1:
        formData.fullName = document.getElementById("fullName").value;
        formData.showName = document.getElementById("showName").value;
        break;

      case 2:
        const selectedTone = currentStepElement.querySelector(
          'input[name="tone"]:checked',
        );
        formData.tone = selectedTone ? selectedTone.value : "";

        const selectedSources = Array.from(
          currentStepElement.querySelectorAll('input[name="sources"]:checked'),
        ).map((cb) => cb.value);
        formData.sources = selectedSources;
        formData.startCatchphrase =
          document.getElementById("startCatchphrase").value;
        formData.endCatchphrase =
          document.getElementById("endCatchphrase").value;
        formData.catchphrasePosition = document.getElementById(
          "catchphrasePosition",
        ).value;

        // Final data save to profile since step 3 is just completion
        saveUserProfile();
        break;
    }

    // Save to localStorage
    localStorage.setItem("zenuOnboardingData", JSON.stringify(formData));
  }

  // Save user profile
  function saveUserProfile() {
    const userProfile = {
      ...formData,
      createdAt: new Date().toISOString(),
      profileComplete: true,
    };

    localStorage.setItem("zenuUserProfile", JSON.stringify(userProfile));
    localStorage.setItem("zenuAuthenticated", "true");

    console.log("User profile saved:", userProfile);
  }

  // Show error
  function showError(message) {
    if (typeof showNotification === "function") {
      showNotification(message, "error");
    } else {
      alert(message);
    }
  }

  // Load existing data if available
  const savedData = localStorage.getItem("zenuOnboardingData");
  if (savedData) {
    formData = JSON.parse(savedData);
    populateForm();
  }

  // Populate form with saved data
  function populateForm() {
    if (formData.fullName)
      document.getElementById("fullName").value = formData.fullName;
    if (formData.showName)
      document.getElementById("showName").value = formData.showName;

    if (formData.tone) {
      const toneRadio = document.querySelector(
        `input[name="tone"][value="${formData.tone}"]`,
      );
      if (toneRadio) toneRadio.checked = true;
    }

    if (formData.sources) {
      formData.sources.forEach((source) => {
        const checkbox = document.querySelector(
          `input[name="sources"][value="${source}"]`,
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    if (formData.startCatchphrase) {
      const startInput = document.getElementById("startCatchphrase");
      if (startInput) startInput.value = formData.startCatchphrase;
    }

    if (formData.endCatchphrase) {
      const endInput = document.getElementById("endCatchphrase");
      if (endInput) endInput.value = formData.endCatchphrase;
    }

    if (formData.catchphrasePosition) {
      const posSelect = document.getElementById("catchphrasePosition");
      if (posSelect) posSelect.value = formData.catchphrasePosition;
    }
  }
});
