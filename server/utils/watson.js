const axios = require('axios');

// ==================== IBM WATSON CONFIGURATION ====================
const WATSON_CONFIG = {
  apiKey: process.env.IBM_WATSON_API_KEY,
  url: process.env.IBM_WATSON_URL || 'https://us-south.ml.cloud.ibm.com',
  projectId: process.env.IBM_WATSON_PROJECT_ID,
  modelId: 'meta-llama/llama-3-70b-instruct' // Or your preferred model
};

// ==================== WATSON API CALL ====================
async function callWatsonAPI(prompt, maxTokens = 500) {
  try {
    // If Watson credentials are not configured, use mock responses
    if (!WATSON_CONFIG.apiKey || WATSON_CONFIG.apiKey === 'your_ibm_watson_api_key_here') {
      console.warn('⚠️ Watson API not configured, using mock AI responses');
      return mockAIResponse(prompt);
    }

    // Real Watson API call
    const response = await axios.post(
      `${WATSON_CONFIG.url}/ml/v1/text/generation?version=2023-05-29`,
      {
        input: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9
        },
        model_id: WATSON_CONFIG.modelId,
        project_id: WATSON_CONFIG.projectId
      },
      {
        headers: {
          'Authorization': `Bearer ${WATSON_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return response.data.results[0].generated_text;

  } catch (error) {
    console.error('Watson API error:', error.message);
    // Fallback to mock response
    return mockAIResponse(prompt);
  }
}

// ==================== MOCK AI RESPONSE ====================
function mockAIResponse(prompt) {
  // Simple mock responses for demo purposes
  if (prompt.includes('summarize') || prompt.includes('clean')) {
    return 'This is a cleaned and summarized version of the news content, removing ads and irrelevant information.';
  }
  if (prompt.includes('rewrite') || prompt.includes('tone')) {
    return 'Yo listeners! What\'s good? Let me break down this story for you in my signature style...';
  }
  if (prompt.includes('template') || prompt.includes('structure')) {
    return 'Good morning everyone! Welcome to the show. Today we\'ve got some exciting stories lined up for you.';
  }
  return 'AI-generated response based on your request.';
}

// ==================== CLEAN AND SUMMARIZE NEWS ====================
async function cleanAndSummarize(rawNews) {
  console.log('🧹 Watson: Cleaning and summarizing news...');

  const cleanedNews = [];

  for (const item of rawNews) {
    const prompt = `
You are a professional news editor. Clean and summarize the following news article for radio broadcast.
Remove any ads, promotional content, or irrelevant information.
Create a concise, clear summary suitable for a radio presenter.

Title: ${item.title}
Content: ${item.content}

Provide:
1. A cleaned title (max 15 words)
2. A broadcast-ready summary (max 50 words)
3. A relevance score (0-10) for general audience
4. A category (politics, sports, entertainment, business, health, technology, or general)

Format as JSON:
{
  "title": "cleaned title",
  "summary": "broadcast summary",
  "relevanceScore": 8,
  "category": "politics"
}
`;

    try {
      const response = await callWatsonAPI(prompt, 300);
      
      // Try to parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch {
        // If not valid JSON, create structured response
        parsed = {
          title: item.title.substring(0, 100),
          summary: item.content.substring(0, 200),
          relevanceScore: 7,
          category: 'general'
        };
      }

      cleanedNews.push({
        id: item.id,
        source: item.source,
        title: parsed.title || item.title,
        summary: parsed.summary || item.content.substring(0, 200),
        category: parsed.category || 'general',
        relevanceScore: parsed.relevanceScore || 7,
        originalUrl: item.url
      });

    } catch (error) {
      console.error('Error cleaning news item:', error.message);
      // Add original item as fallback
      cleanedNews.push({
        id: item.id,
        source: item.source,
        title: item.title,
        summary: item.content.substring(0, 200),
        category: 'general',
        relevanceScore: 5,
        originalUrl: item.url
      });
    }
  }

  return cleanedNews;
}

// ==================== REWRITE IN OAP TONE ====================
async function rewriteInTone(cleanedNews, profile) {
  console.log('🎨 Watson: Rewriting in presenter tone...');

  const styledNews = [];

  // Build presenter style description
  const stylePrompt = `
Presenter Profile:
- Languages: ${profile.preferredLanguage.join(', ')}
- Speaking Speed: ${profile.speakingSpeed}
- Signature Intro: "${profile.signatureIntro}"
- Signature Outro: "${profile.signatureOutro}"
- Tone: ${profile.toneDescription || 'Professional and engaging'}
- Formality: ${profile.formalityLevel}
- Use Emojis: ${profile.useEmojis ? 'Yes' : 'No'}
`;

  for (const item of cleanedNews) {
    const prompt = `
${stylePrompt}

Rewrite this news story in the presenter's exact speaking style and tone.
Match their energy, cadence, and language preferences.
Make it sound natural for radio broadcast.

Original: ${item.summary}

Provide the rewritten version that sounds like this specific presenter would say it.
Include natural pauses, emphasis points, and their signature style.
`;

    try {
      const styledContent = await callWatsonAPI(prompt, 400);

      styledNews.push({
        id: item.id,
        originalTitle: item.title,
        styledContent: styledContent.trim(),
        tone: profile.formalityLevel,
        language: profile.preferredLanguage[0],
        emphasis: extractEmphasisPoints(styledContent),
        category: item.category,
        source: item.source
      });

    } catch (error) {
      console.error('Error styling news item:', error.message);
      styledNews.push({
        id: item.id,
        originalTitle: item.title,
        styledContent: item.summary,
        tone: 'neutral',
        language: 'English',
        emphasis: [],
        category: item.category,
        source: item.source
      });
    }
  }

  return styledNews;
}

// ==================== POPULATE SHOW TEMPLATE ====================
async function populateTemplate(styledNews, showStructure, profile) {
  console.log('📋 Watson: Populating show template...');

  const sections = [];

  // Sort show structure by order
  const sortedStructure = [...showStructure].sort((a, b) => a.order - b.order);

  for (const structureItem of sortedStructure) {
    let content = '';

    switch (structureItem.section.toLowerCase()) {
      case 'intro':
        content = profile.signatureIntro || `Good morning everyone! Welcome to the show. I'm your host, and we've got an amazing lineup for you today.`;
        break;

      case 'weather':
        content = `Let's check out the weather. It's looking like a beautiful day ahead, so make sure you're prepared!`;
        break;

      case 'trending_news':
      case 'trending news':
        const trendingItems = styledNews.slice(0, 3);
        content = trendingItems.map((item, i) => 
          `Story ${i + 1}: ${item.styledContent}`
        ).join('\n\n');
        break;

      case 'global_headlines':
      case 'global headlines':
        const globalItems = styledNews.slice(3, 5);
        content = globalItems.map((item, i) => 
          `International news ${i + 1}: ${item.styledContent}`
        ).join('\n\n');
        break;

      case 'human_interest':
      case 'human interest':
        const humanInterest = styledNews.find(item => 
          item.category === 'entertainment' || item.category === 'general'
        );
        content = humanInterest ? humanInterest.styledContent : 
          `Here's an inspiring story that'll warm your heart...`;
        break;

      case 'traffic':
        content = `Traffic update: Roads are looking good this morning. Stay safe out there!`;
        break;

      case 'outro':
        content = profile.signatureOutro || `That's all for today folks! Thanks for tuning in. Stay blessed and I'll catch you next time!`;
        break;

      default:
        content = `[${structureItem.section} section]`;
    }

    sections.push({
      type: structureItem.section,
      content,
      duration: structureItem.duration,
      order: structureItem.order
    });
  }

  return { sections };
}

// ==================== GENERATE TELEPROMPTER SCRIPT ====================
async function generateTeleprompterScript(populatedScript, formatting = {}) {
  console.log('✨ Watson: Generating teleprompter script...');

  const chunks = [];

  for (const section of populatedScript.sections) {
    // Split content into manageable chunks for teleprompter
    const sentences = section.content.split(/[.!?]+/).filter(s => s.trim());

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      // Detect emphasis (words in caps, exclamation marks, etc.)
      const hasEmphasis = /[A-Z]{2,}|!/.test(trimmed);
      
      // Detect pauses (commas, dashes, ellipsis)
      const pauseCount = (trimmed.match(/[,—…]/g) || []).length;
      const pauseDuration = pauseCount * 500; // 500ms per pause marker

      chunks.push({
        text: trimmed + '.',
        emphasis: hasEmphasis,
        pause: pauseDuration,
        notes: `[${section.type}]`,
        sectionType: section.type
      });
    }

    // Add section break pause
    if (section.type !== 'outro') {
      chunks.push({
        text: '',
        emphasis: false,
        pause: 2000,
        notes: `[End of ${section.type}]`,
        sectionType: 'break'
      });
    }
  }

  return { chunks };
}

// ==================== HELPER: EXTRACT EMPHASIS POINTS ====================
function extractEmphasisPoints(text) {
  const emphasis = [];
  
  // Find words in ALL CAPS
  const capsWords = text.match(/\b[A-Z]{2,}\b/g);
  if (capsWords) emphasis.push(...capsWords);

  // Find words with exclamation
  const exclamations = text.match(/\b\w+!/g);
  if (exclamations) emphasis.push(...exclamations.map(w => w.replace('!', '')));

  return [...new Set(emphasis)]; // Remove duplicates
}

module.exports = {
  cleanAndSummarize,
  rewriteInTone,
  populateTemplate,
  generateTeleprompterScript,
  callWatsonAPI
};
