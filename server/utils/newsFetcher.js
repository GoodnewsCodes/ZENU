const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['description', 'content', 'content:encoded']
  }
});

// ==================== NEWS SOURCES ====================
const NEWS_SOURCES = {
  vanguard: {
    name: 'Vanguard Nigeria',
    rss: 'https://www.vanguardngr.com/feed/',
    scrape: 'https://www.vanguardngr.com'
  },
  punch: {
    name: 'The Punch',
    rss: 'https://punchng.com/feed/',
    scrape: 'https://punchng.com'
  },
  arise: {
    name: 'Arise News',
    rss: null,
    scrape: 'https://www.arise.tv/news/'
  },
  local: {
    name: 'Local Community Reports',
    rss: null,
    scrape: null
  }
};

// ==================== FETCH FROM RSS ====================
async function fetchFromRSS(feedUrl, sourceName) {
  try {
    console.log(`📡 Fetching RSS from ${sourceName}...`);
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.map((item, index) => ({
      id: `${sourceName}-${index}-${Date.now()}`,
      source: sourceName,
      title: item.title || 'Untitled',
      content: item.contentSnippet || item.description || item.content || '',
      url: item.link || '',
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
    }));
  } catch (error) {
    console.error(`Error fetching RSS from ${sourceName}:`, error.message);
    return [];
  }
}

// ==================== SCRAPE WEB PAGE ====================
async function scrapeWebPage(url, sourceName) {
  try {
    console.log(`🕷️ Scraping ${sourceName}...`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const articles = [];

    // Generic article extraction (customize per source)
    $('article, .post, .news-item, .article').slice(0, 10).each((index, element) => {
      const $article = $(element);
      const title = $article.find('h1, h2, h3, .title, .headline').first().text().trim();
      const content = $article.find('p, .excerpt, .summary').first().text().trim();
      const link = $article.find('a').first().attr('href');

      if (title) {
        articles.push({
          id: `${sourceName}-scraped-${index}-${Date.now()}`,
          source: sourceName,
          title,
          content: content || title,
          url: link && link.startsWith('http') ? link : `${url}${link}`,
          publishedAt: new Date()
        });
      }
    });

    return articles;
  } catch (error) {
    console.error(`Error scraping ${sourceName}:`, error.message);
    return [];
  }
}

// ==================== GENERATE MOCK NEWS ====================
function generateMockNews(sourceName, count = 5) {
  console.log(`🎭 Generating mock news for ${sourceName}...`);
  
  const mockTitles = [
    'President Announces New Economic Policy for Growth',
    'Lagos Traffic: New Solutions Proposed by State Government',
    'Nigerian Tech Startup Raises $10M in Funding',
    'Super Eagles Qualify for International Tournament',
    'Education Reform: Universities to Adopt New Curriculum',
    'Healthcare Workers Begin Nationwide Strike',
    'Nollywood Star Wins International Award',
    'Fuel Prices Expected to Drop Next Week',
    'New Infrastructure Projects Launched in Abuja',
    'Climate Change: Nigeria Commits to Green Energy'
  ];

  const mockContent = [
    'In a major development today, officials announced significant changes that will impact millions of Nigerians across the country.',
    'Local authorities have confirmed new measures aimed at addressing long-standing challenges in the region.',
    'Experts believe this development marks a turning point in the ongoing efforts to improve conditions nationwide.',
    'Community leaders have welcomed the announcement, calling it a step in the right direction.',
    'The initiative is expected to create thousands of jobs and boost economic activity in the coming months.'
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `${sourceName}-mock-${index}-${Date.now()}`,
    source: sourceName,
    title: mockTitles[index % mockTitles.length],
    content: mockContent[index % mockContent.length],
    url: `https://example.com/news/${index}`,
    publishedAt: new Date(Date.now() - Math.random() * 86400000) // Random time in last 24h
  }));
}

// ==================== FETCH FROM MULTIPLE SOURCES ====================
async function fetchFromMultipleSources(sources = ['vanguard', 'punch'], categories = [], limit = 10) {
  const allNews = [];

  for (const source of sources) {
    const sourceConfig = NEWS_SOURCES[source];
    
    if (!sourceConfig) {
      console.warn(`⚠️ Unknown source: ${source}`);
      continue;
    }

    let newsItems = [];

    // Try RSS first
    if (sourceConfig.rss) {
      newsItems = await fetchFromRSS(sourceConfig.rss, source);
    }

    // If RSS failed or not available, try scraping
    if (newsItems.length === 0 && sourceConfig.scrape) {
      newsItems = await scrapeWebPage(sourceConfig.scrape, source);
    }

    // If both failed, generate mock data for demo
    if (newsItems.length === 0) {
      console.warn(`⚠️ Using mock data for ${source}`);
      newsItems = generateMockNews(source, 5);
    }

    allNews.push(...newsItems);
  }

  // Shuffle and limit
  const shuffled = allNews.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

// ==================== FILTER BY CATEGORY ====================
function filterByCategory(newsItems, categories) {
  if (!categories || categories.length === 0) {
    return newsItems;
  }

  // Simple keyword-based categorization
  const categoryKeywords = {
    politics: ['president', 'government', 'election', 'senate', 'policy', 'minister'],
    sports: ['football', 'eagles', 'match', 'tournament', 'player', 'coach'],
    entertainment: ['nollywood', 'music', 'celebrity', 'movie', 'artist', 'award'],
    business: ['economy', 'market', 'business', 'trade', 'investment', 'startup'],
    technology: ['tech', 'digital', 'internet', 'software', 'innovation', 'ai'],
    health: ['health', 'hospital', 'doctor', 'medical', 'disease', 'treatment']
  };

  return newsItems.filter(item => {
    const text = `${item.title} ${item.content}`.toLowerCase();
    return categories.some(category => {
      const keywords = categoryKeywords[category.toLowerCase()] || [];
      return keywords.some(keyword => text.includes(keyword));
    });
  });
}

module.exports = {
  fetchFromMultipleSources,
  fetchFromRSS,
  scrapeWebPage,
  generateMockNews,
  filterByCategory,
  NEWS_SOURCES
};
