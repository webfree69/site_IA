const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml'
  }
});

const RSS_FEEDS = [
  {
    name: 'NVIDIA Blog',
    url: 'https://feeds.feedburner.com/nvidiablog',
    color: '#76b900'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    color: '#0a9e01'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    color: '#e5127d'
  },
  {
    name: 'Reuters Tech',
    url: 'https://feeds.reuters.com/reuters/technologyNews',
    color: '#ff8000'
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    color: '#10a37f'
  }
];

const MAX_ARTICLES_PER_SOURCE = 50;
const FEED_PATH = path.join(__dirname, 'feed.json');

async function fetchFeed(feedConfig) {
  try {
    console.log(`⏳ Fetching: ${feedConfig.name}...`);
    const feed = await parser.parseURL(feedConfig.url);
    const articles = (feed.items || []).slice(0, MAX_ARTICLES_PER_SOURCE).map(item => ({
      title: item.title || 'Sans titre',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || item['content:encodedSnippet'] || item.content?.substring(0, 300) || '',
      source: feedConfig.name,
      sourceColor: feedConfig.color,
      image: extractImage(item)
    }));
    console.log(`✅ ${feedConfig.name}: ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error(`❌ Error ${feedConfig.name}: ${error.message}`);
    return [];
  }
}

function extractImage(item) {
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url;
  }
  if (item['media:content']?.$?.url) {
    return item['media:content'].$.url;
  }
  if (item['media:thumbnail']?.$?.url) {
    return item['media:thumbnail'].$.url;
  }
  const content = item['content:encoded'] || item.content || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];
  return null;
}

function deduplicate(articles) {
  const seen = new Set();
  return articles.filter(article => {
    if (!article.link || seen.has(article.link)) return false;
    seen.add(article.link);
    return true;
  });
}

function sortByDate(articles) {
  return articles.sort((a, b) => {
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    return dateB - dateA;
  });
}

async function main() {
  console.log('🚀 Démarrage de la récupération des actualités IA...\n');
  
  const allArticles = [];
  
  for (const feedConfig of RSS_FEEDS) {
    const articles = await fetchFeed(feedConfig);
    allArticles.push(...articles);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const uniqueArticles = deduplicate(allArticles);
  const sortedArticles = sortByDate(uniqueArticles);
  
  const feedData = {
    lastUpdated: new Date().toISOString(),
    totalArticles: sortedArticles.length,
    articles: sortedArticles
  };
  
  fs.writeFileSync(FEED_PATH, JSON.stringify(feedData, null, 2), 'utf8');
  
  console.log(`\n✅ Terminé ! ${sortedArticles.length} articles sauvegardés dans feed.json`);
  console.log(`📅 Dernière mise à jour: ${feedData.lastUpdated}`);
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});