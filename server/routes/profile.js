const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const mongoose = require('mongoose');

// ==================== PROFILE MODEL ====================
const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Language preferences
  preferredLanguage: {
    type: [String],
    default: ['English']
  },
  // Speaking characteristics
  speakingSpeed: {
    type: String,
    enum: ['slow', 'medium', 'fast'],
    default: 'medium'
  },
  // Signature phrases
  signatureIntro: {
    type: String,
    default: ''
  },
  signatureOutro: {
    type: String,
    default: ''
  },
  // Content preferences
  topicPreferences: {
    type: [String],
    default: []
  },
  // Show structure template
  showStructure: [{
    section: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 60
    },
    order: {
      type: Number,
      required: true
    }
  }],
  // Voice characteristics
  voiceSample: {
    type: String,
    default: ''
  },
  toneDescription: {
    type: String,
    default: ''
  },
  // Additional preferences
  useEmojis: {
    type: Boolean,
    default: false
  },
  formalityLevel: {
    type: String,
    enum: ['casual', 'professional', 'mixed'],
    default: 'professional'
  },
  // Metadata
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

// ==================== GET PROFILE ====================
router.get('/', verifyToken, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });

    // Create default profile if doesn't exist
    if (!profile) {
      profile = new Profile({
        userId: req.userId,
        showStructure: [
          { section: 'intro', duration: 30, order: 1 },
          { section: 'weather', duration: 60, order: 2 },
          { section: 'trending_news', duration: 180, order: 3 },
          { section: 'global_headlines', duration: 120, order: 4 },
          { section: 'human_interest', duration: 90, order: 5 },
          { section: 'traffic', duration: 60, order: 6 },
          { section: 'outro', duration: 30, order: 7 }
        ]
      });
      await profile.save();
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// ==================== UPDATE PROFILE ====================
router.put('/', verifyToken, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // If showStructure is being updated, ensure it's properly formatted
    if (updateData.showStructure) {
      updateData.showStructure = updateData.showStructure.map((section, index) => ({
        ...section,
        order: section.order !== undefined ? section.order : index + 1
      }));
    }

    // Check if onboarding is being completed
    if (updateData.onboardingCompleted === true) {
      console.log('✅ Onboarding completed for user:', req.userId);
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// ==================== CREATE/UPDATE SHOW STRUCTURE ====================
router.post('/show-structure', verifyToken, async (req, res) => {
  try {
    const { showStructure } = req.body;

    if (!showStructure || !Array.isArray(showStructure)) {
      return res.status(400).json({
        success: false,
        message: 'Show structure array is required'
      });
    }

    // Validate and format show structure
    const formattedStructure = showStructure.map((section, index) => ({
      section: section.section,
      duration: section.duration || 60,
      order: section.order !== undefined ? section.order : index + 1
    }));

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { 
        showStructure: formattedStructure,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Show structure updated successfully',
      data: profile.showStructure
    });

  } catch (error) {
    console.error('Update show structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating show structure',
      error: error.message
    });
  }
});

// ==================== GET PROFILE COMPLETENESS ====================
router.get('/completeness', verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.json({
        success: true,
        completeness: 0,
        missingFields: ['All fields']
      });
    }

    // Calculate profile completeness
    const fields = [
      'preferredLanguage',
      'speakingSpeed',
      'signatureIntro',
      'signatureOutro',
      'topicPreferences',
      'showStructure',
      'toneDescription'
    ];

    let completedFields = 0;
    const missingFields = [];

    fields.forEach(field => {
      const value = profile[field];
      if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
        completedFields++;
      } else {
        missingFields.push(field);
      }
    });

    const completeness = Math.round((completedFields / fields.length) * 100);

    res.json({
      success: true,
      completeness,
      missingFields,
      onboardingCompleted: profile.onboardingCompleted
    });

  } catch (error) {
    console.error('Get completeness error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating profile completeness',
      error: error.message
    });
  }
});

module.exports = router;
