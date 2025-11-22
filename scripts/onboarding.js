// ========================================
// ZENU - Onboarding Script
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 5;
    let formData = {};
    
    // Elements
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const voiceFile = document.getElementById('voiceFile');
    const uploadedFile = document.getElementById('uploadedFile');
    const removeFile = document.getElementById('removeFile');
    
    // Initialize
    updateProgress();
    
    // Next button
    nextBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            saveStepData(currentStep);
            currentStep++;
            updateProgress();
            updateButtons();
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        currentStep--;
        updateProgress();
        updateButtons();
    });
    
    // Update progress
    function updateProgress() {
        // Update progress bar
        const progress = (currentStep / totalSteps) * 100;
        progressFill.style.width = progress + '%';
        
        // Update step indicators
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            if (stepNumber < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // Update form steps
        formSteps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    // Update buttons
    function updateButtons() {
        // Previous button
        if (currentStep === 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-flex';
        }
        
        // Next/Complete button
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            completeBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            completeBtn.style.display = 'none';
        }
    }
    
    // Validate step
    function validateStep(step) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        const requiredInputs = currentStepElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = currentStepElement.querySelectorAll(`[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    isValid = false;
                    showError('Please select an option');
                }
            } else if (input.type === 'checkbox') {
                // Checkboxes are optional unless specifically required
            } else if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--primary-color)';
                showError('Please fill in all required fields');
            } else {
                input.style.borderColor = '';
            }
        });
        
        // Special validation for step 4 (voice sample)
        if (step === 4) {
            const skipVoice = document.getElementById('skipVoice');
            const hasFile = voiceFile.files.length > 0;
            
            if (!hasFile && !skipVoice.checked) {
                showError('Please upload a voice sample or check "Skip for now"');
                return false;
            }
        }
        
        return isValid;
    }
    
    // Save step data
    function saveStepData(step) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        
        switch(step) {
            case 1:
                formData.fullName = document.getElementById('fullName').value;
                formData.email = document.getElementById('email').value;
                formData.showName = document.getElementById('showName').value;
                formData.station = document.getElementById('station').value;
                formData.bio = document.getElementById('bio').value;
                break;
                
            case 2:
                const selectedTone = currentStepElement.querySelector('input[name="tone"]:checked');
                formData.tone = selectedTone ? selectedTone.value : '';
                
                const selectedTraits = Array.from(currentStepElement.querySelectorAll('input[name="traits"]:checked'))
                    .map(cb => cb.value);
                formData.traits = selectedTraits;
                break;
                
            case 3:
                formData.language = document.getElementById('language').value;
                formData.showTemplate = document.getElementById('showTemplate').value;
                formData.scriptLength = document.getElementById('scriptLength').value;
                
                const selectedSources = Array.from(currentStepElement.querySelectorAll('input[name="sources"]:checked'))
                    .map(cb => cb.value);
                formData.sources = selectedSources;
                break;
                
            case 4:
                formData.voiceFile = voiceFile.files[0] || null;
                formData.skipVoice = document.getElementById('skipVoice').checked;
                break;
        }
        
        // Save to localStorage
        localStorage.setItem('zenuOnboardingData', JSON.stringify(formData));
        
        // If final step, save to user profile
        if (step === 4) {
            saveUserProfile();
        }
    }
    
    // Save user profile
    function saveUserProfile() {
        // In a real app, this would send data to the backend
        const userProfile = {
            ...formData,
            createdAt: new Date().toISOString(),
            profileComplete: true
        };
        
        localStorage.setItem('zenuUserProfile', JSON.stringify(userProfile));
        localStorage.setItem('zenuAuthenticated', 'true');
        
        console.log('User profile saved:', userProfile);
    }
    
    // Show error
    function showError(message) {
        // Use the notification function from navigation.js
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
    
    // File upload handling
    if (uploadArea && voiceFile) {
        uploadArea.addEventListener('click', () => voiceFile.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
        
        voiceFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
        
        removeFile.addEventListener('click', () => {
            voiceFile.value = '';
            uploadArea.style.display = 'block';
            uploadedFile.style.display = 'none';
            document.getElementById('skipVoice').checked = false;
        });
    }
    
    // Handle file upload
    function handleFileUpload(file) {
        // Validate file type
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
        if (!validTypes.includes(file.type)) {
            showError('Please upload a valid audio file (MP3, WAV, or M4A)');
            return;
        }
        
        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showError('File size must be less than 10MB');
            return;
        }
        
        // Display file info
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        
        uploadArea.style.display = 'none';
        uploadedFile.style.display = 'flex';
        
        // Uncheck skip option
        document.getElementById('skipVoice').checked = false;
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    // Skip voice checkbox handler
    const skipVoice = document.getElementById('skipVoice');
    if (skipVoice) {
        skipVoice.addEventListener('change', function() {
            if (this.checked && voiceFile.files.length > 0) {
                // Clear uploaded file if skip is checked
                voiceFile.value = '';
                uploadArea.style.display = 'block';
                uploadedFile.style.display = 'none';
            }
        });
    }
    
    // Load existing data if available
    const savedData = localStorage.getItem('zenuOnboardingData');
    if (savedData) {
        formData = JSON.parse(savedData);
        populateForm();
    }
    
    // Populate form with saved data
    function populateForm() {
        if (formData.fullName) document.getElementById('fullName').value = formData.fullName;
        if (formData.email) document.getElementById('email').value = formData.email;
        if (formData.showName) document.getElementById('showName').value = formData.showName;
        if (formData.station) document.getElementById('station').value = formData.station;
        if (formData.bio) document.getElementById('bio').value = formData.bio;
        if (formData.language) document.getElementById('language').value = formData.language;
        if (formData.showTemplate) document.getElementById('showTemplate').value = formData.showTemplate;
        if (formData.scriptLength) document.getElementById('scriptLength').value = formData.scriptLength;
        
        // Radio buttons
        if (formData.tone) {
            const toneRadio = document.querySelector(`input[name="tone"][value="${formData.tone}"]`);
            if (toneRadio) toneRadio.checked = true;
        }
        
        // Checkboxes
        if (formData.traits) {
            formData.traits.forEach(trait => {
                const checkbox = document.querySelector(`input[name="traits"][value="${trait}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (formData.sources) {
            formData.sources.forEach(source => {
                const checkbox = document.querySelector(`input[name="sources"][value="${source}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
});
