// ========================================
// ZENU - Profile Management
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  const profileForm = document.getElementById("profileForm");
  const avatarDisplay = document.getElementById("avatarDisplay");
  const displayName = document.getElementById("displayName");
  const displayShow = document.getElementById("displayShow");
  const notification = document.getElementById("notification");

  // Load profile data
  loadProfile();

  // Form submission
  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveProfile();
  });

  function loadProfile() {
    const savedProfile = localStorage.getItem("zenuUserProfile");
    if (!savedProfile) {
      // If no profile, redirect to onboarding or show empty
      console.warn("No user profile found");
      return;
    }

    const profile = JSON.parse(savedProfile);

    // Populate text inputs
    if (profile.fullName) {
      document.getElementById("fullName").value = profile.fullName;
      updateAvatar(profile.fullName);
      displayName.textContent = profile.fullName;
    }

    if (profile.showName) {
      document.getElementById("showName").value = profile.showName;
      displayShow.textContent = profile.showName;
    }

    if (profile.startCatchphrase) {
      document.getElementById("startCatchphrase").value =
        profile.startCatchphrase;
    }

    if (profile.endCatchphrase) {
      document.getElementById("endCatchphrase").value = profile.endCatchphrase;
    }

    if (profile.catchphrasePosition) {
      document.getElementById("catchphrasePosition").value =
        profile.catchphrasePosition;
    }

    // Populate radio buttons (tone)
    if (profile.tone) {
      const toneRadio = document.querySelector(
        `input[name="tone"][value="${profile.tone}"]`,
      );
      if (toneRadio) toneRadio.checked = true;
    }

    // Populate checkboxes (sources)
    if (profile.sources && Array.isArray(profile.sources)) {
      profile.sources.forEach((source) => {
        const checkbox = document.querySelector(
          `input[name="sources"][value="${source}"]`,
        );
        if (checkbox) checkbox.checked = true;
      });
    }
  }

  function saveProfile() {
    const fullName = document.getElementById("fullName").value;
    const showName = document.getElementById("showName").value;
    const tone = document.querySelector('input[name="tone"]:checked')?.value;
    const startCatchphrase = document.getElementById("startCatchphrase").value;
    const endCatchphrase = document.getElementById("endCatchphrase").value;
    const catchphrasePosition = document.getElementById(
      "catchphrasePosition",
    ).value;

    const sources = Array.from(
      document.querySelectorAll('input[name="sources"]:checked'),
    ).map((cb) => cb.value);

    const updatedProfile = {
      fullName,
      showName,
      tone,
      sources,
      startCatchphrase,
      endCatchphrase,
      catchphrasePosition,
      updatedAt: new Date().toISOString(),
      profileComplete: true,
    };

    // Save to localStorage
    localStorage.setItem("zenuUserProfile", JSON.stringify(updatedProfile));

    // Also update onboarding data for consistency
    localStorage.setItem("zenuOnboardingData", JSON.stringify(updatedProfile));

    // Update UI displays
    displayName.textContent = fullName;
    displayShow.textContent = showName;
    updateAvatar(fullName);

    showNotification("Profile updated successfully!", "success");
  }

  function updateAvatar(name) {
    if (!name) return;
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
    avatarDisplay.textContent = initials;
  }
});
