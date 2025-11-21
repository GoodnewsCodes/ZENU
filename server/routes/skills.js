const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const newsFetcher = require('../utils/newsFetcher');
const watsonService = require('../utils/watson');
const mongoose = require('mongoose');

// ==================== SCRIPT MODEL ====================
const ScriptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Script'
  },
  rawNews: [{
    id: String,
    source: String,
    title: String,
    content: String,
    url: String,
    publishedAt: Date
  }],
  cleanedNews: [{
    id: String,
    source: String,
    title: String,
    summary: String,
    category: String,
    relevanceScore: Number
  }],
  styledNews: [{
    id: String,
    originalTitle: String,
    styledContent: String,
    tone: String,
    language: String,
    emphasis: [String]
  }],
  populatedScript: {
    sections: [{
      type: String,
      content: String,
      duration: Number
    }]
  },
  teleprompterScript: {
    chunks: [{
      text: String,
      emphasis: Boolean,
      pause: Number,
      notes: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'ready', 'delivered'],
    default: 'draft'
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

const Script = mongoose.models.Script || mongoose.model('Script', ScriptSchema);

// ==================== DIGITAL SKILL 1: FETCH NEWS ====================
router.post('/fetch-news', verifyToken, async (req, res) => {
  try {
    const { sources = ['vanguard', 'punch', 'arise'], categories = [], limit = 10 } = req.body;

    console.log('📰 Fetching news from sources:', sources);

    // Fetch news from multiple sources
    const rawNews = await newsFetcher.fetchFromMultipleSources(sources, categories, limit);

    // Create a new script document
    const script = new Script({
      userId: req.userId,
      rawNews,
      status: 'processing'
    });

    await script.save();

    res.json({
      success: true,
      message: `Fetched ${rawNews.length} news items`,
      data: rawNews,
      scriptId: script._id
    });

  } catch (error) {
    console.error('Fetch news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message
    });
  }
});

// ==================== DIGITAL SKILL 2: CLEAN & SUMMARIZE NEWS ====================
router.post('/clean-news', verifyToken, async (req, res) => {
  try {
    const { rawNews, scriptId } = req.body;

    if (!rawNews || !Array.isArray(rawNews)) {
      return res.status(400).json({
        success: false,
        message: 'Raw news array is required'
      });
    }

    console.log('🧹 Cleaning and summarizing news...');

    // Use Watson to clean and summarize
    const cleanedNews = await watsonService.cleanAndSummarize(rawNews);

    // Update script if scriptId provided
    if (scriptId) {
      await Script.findByIdAndUpdate(scriptId, {
        cleanedNews,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: `Cleaned ${cleanedNews.length} news items`,
      data: cleanedNews
    });

  } catch (error) {
    console.error('Clean news error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning news',
      error: error.message
    });
  }
});

// ==================== DIGITAL SKILL 3: REWRITE IN OAP TONE ====================
router.post('/rewrite-tone', verifyToken, async (req, res) => {
  try {
    const { cleanedNews, presenterId, scriptId } = req.body;

    if (!cleanedNews || !Array.isArray(cleanedNews)) {
      return res.status(400).json({
        success: false,
        message: 'Cleaned news array is required'
      });
    }

    console.log('🎨 Rewriting news in presenter tone...');

    // Get presenter profile
    const Profile = mongoose.models.Profile;
    const profile = await Profile.findOne({ userId: presenterId || req.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Presenter profile not found. Please complete onboarding first.'
      });
    }

    // Use Watson to rewrite in presenter's style
    const styledNews = await watsonService.rewriteInTone(cleanedNews, profile);

    // Update script if scriptId provided
    if (scriptId) {
      await Script.findByIdAndUpdate(scriptId, {
        styledNews,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: `Styled ${styledNews.length} news items`,
      data: styledNews
    });

  } catch (error) {
    console.error('Rewrite tone error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rewriting news tone',
      error: error.message
    });
  }
});

// ==================== DIGITAL SKILL 4: POPULATE SHOW TEMPLATE ====================
router.post('/populate-template', verifyToken, async (req, res) => {
  try {
    const { styledNews, presenterId, scriptId, templateOverride } = req.body;

    if (!styledNews || !Array.isArray(styledNews)) {
      return res.status(400).json({
        success: false,
        message: 'Styled news array is required'
      });
    }

    console.log('📋 Populating show template...');

    // Get presenter profile for show structure
    const Profile = mongoose.models.Profile;
    const profile = await Profile.findOne({ userId: presenterId || req.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Presenter profile not found'
      });
    }

    // Use template override or profile's show structure
    const template = templateOverride || profile.showStructure;

    // Populate template with styled news
    const populatedScript = await watsonService.populateTemplate(styledNews, template, profile);

    // Update script if scriptId provided
    if (scriptId) {
      await Script.findByIdAndUpdate(scriptId, {
        populatedScript,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Template populated successfully',
      data: populatedScript
    });

  } catch (error) {
    console.error('Populate template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error populating template',
      error: error.message
    });
  }
});

// ==================== DIGITAL SKILL 5: GENERATE FINAL SCRIPT ====================
router.post('/generate-script', verifyToken, async (req, res) => {
  try {
    const { populatedScript, scriptId, formatting = {} } = req.body;

    if (!populatedScript) {
      return res.status(400).json({
        success: false,
        message: 'Populated script is required'
      });
    }

    console.log('✨ Generating teleprompter script...');

    // Generate teleprompter-ready script
    const teleprompterScript = await watsonService.generateTeleprompterScript(
      populatedScript,
      formatting
    );

    // Update script if scriptId provided
    if (scriptId) {
      await Script.findByIdAndUpdate(scriptId, {
        teleprompterScript,
        status: 'ready',
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Teleprompter script generated successfully',
      data: teleprompterScript,
      scriptId
    });

  } catch (error) {
    console.error('Generate script error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating script',
      error: error.message
    });
  }
});

// ==================== DIGITAL SKILL 6: DELIVER SCRIPT ====================
router.post('/deliver-script', verifyToken, async (req, res) => {
  try {
    const { scriptId, deliveryMethod = ['ui'] } = req.body;

    if (!scriptId) {
      return res.status(400).json({
        success: false,
        message: 'Script ID is required'
      });
    }

    console.log('🚀 Delivering script via:', deliveryMethod);

    // Get the script
    const script = await Script.findById(scriptId);
    if (!script) {
      return res.status(404).json({
        success: false,
        message: 'Script not found'
      });
    }

    // Mark as delivered
    script.status = 'delivered';
    script.updatedAt = new Date();
    await script.save();

    // Delivery methods
    const deliveryResults = {};

    if (deliveryMethod.includes('ui')) {
      deliveryResults.ui = {
        success: true,
        url: `/teleprompter?scriptId=${scriptId}`
      };
    }

    if (deliveryMethod.includes('email')) {
      // TODO: Implement email delivery
      deliveryResults.email = {
        success: true,
        message: 'Email delivery would be implemented here'
      };
    }

    if (deliveryMethod.includes('slack')) {
      // TODO: Implement Slack delivery
      deliveryResults.slack = {
        success: true,
        message: 'Slack delivery would be implemented here'
      };
    }

    if (deliveryMethod.includes('whatsapp')) {
      // TODO: Implement WhatsApp delivery
      deliveryResults.whatsapp = {
        success: true,
        message: 'WhatsApp delivery would be implemented here'
      };
    }

    res.json({
      success: true,
      message: 'Script delivered successfully',
      deliveryResults,
      teleprompterUrl: `/teleprompter?scriptId=${scriptId}`
    });

  } catch (error) {
    console.error('Deliver script error:', error);
    res.status(500).json({
      success: false,
      message: 'Error delivering script',
      error: error.message
    });
  }
});

// ==================== COMPLETE WORKFLOW (All 6 Skills) ====================
router.post('/complete-workflow', verifyToken, async (req, res) => {
  try {
    const { 
      sources = ['vanguard', 'punch', 'arise'], 
      categories = [],
      limit = 10,
      deliveryMethod = ['ui'] 
    } = req.body;

    console.log('🔄 Starting complete ZENU workflow...');

    // Get presenter profile
    const Profile = mongoose.models.Profile;
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Please complete your profile onboarding first'
      });
    }

    // SKILL 1: Fetch News
    console.log('Step 1/6: Fetching news...');
    const rawNews = await newsFetcher.fetchFromMultipleSources(sources, categories, limit);

    // SKILL 2: Clean & Summarize
    console.log('Step 2/6: Cleaning news...');
    const cleanedNews = await watsonService.cleanAndSummarize(rawNews);

    // SKILL 3: Rewrite in Tone
    console.log('Step 3/6: Styling news...');
    const styledNews = await watsonService.rewriteInTone(cleanedNews, profile);

    // SKILL 4: Populate Template
    console.log('Step 4/6: Populating template...');
    const populatedScript = await watsonService.populateTemplate(styledNews, profile.showStructure, profile);

    // SKILL 5: Generate Script
    console.log('Step 5/6: Generating teleprompter script...');
    const teleprompterScript = await watsonService.generateTeleprompterScript(populatedScript);

    // Save complete script
    const script = new Script({
      userId: req.userId,
      title: `Script - ${new Date().toLocaleDateString()}`,
      rawNews,
      cleanedNews,
      styledNews,
      populatedScript,
      teleprompterScript,
      status: 'delivered'
    });

    await script.save();

    // SKILL 6: Deliver
    console.log('Step 6/6: Delivering script...');

    res.json({
      success: true,
      message: 'Complete workflow executed successfully! 🎉',
      scriptId: script._id,
      teleprompterUrl: `/teleprompter?scriptId=${script._id}`,
      stats: {
        newsItemsFetched: rawNews.length,
        newsItemsCleaned: cleanedNews.length,
        sectionsGenerated: populatedScript.sections?.length || 0,
        teleprompterChunks: teleprompterScript.chunks?.length || 0
      }
    });

  } catch (error) {
    console.error('Complete workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing workflow',
      error: error.message
    });
  }
});

// ==================== GET SCRIPT BY ID ====================
router.get('/script/:id', verifyToken, async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);

    if (!script) {
      return res.status(404).json({
        success: false,
        message: 'Script not found'
      });
    }

    // Check ownership
    if (script.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    res.json({
      success: true,
      data: script
    });

  } catch (error) {
    console.error('Get script error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching script',
      error: error.message
    });
  }
});

// ==================== GET ALL USER SCRIPTS ====================
router.get('/scripts', verifyToken, async (req, res) => {
  try {
    const scripts = await Script.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: scripts,
      count: scripts.length
    });

  } catch (error) {
    console.error('Get scripts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scripts',
      error: error.message
    });
  }
});

module.exports = router;
