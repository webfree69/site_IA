const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  },
  maxRedirects: 3,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'content:encoded', 'content:encodedSnippet']
  }
});

const RSS_FEEDS = [
  {
    name: 'Numerama',
    url: 'https://www.numerama.com/feed/',
    color: '#e5127d',
    priority: 1
  },
  {
    name: 'Frandroid',
    url: 'https://www.frandroid.com/feed',
    color: '#00b9ff',
    priority: 1
  },
  {
    name: 'Journal du Geek',
    url: 'https://www.journaldugeek.com/feed/',
    color: '#ff6600',
    priority: 1
  },
  {
    name: '01net',
    url: 'https://www.01net.com/rss/actualites/',
    color: '#0033a0',
    priority: 2
  },
  {
    name: 'Next Inpact',
    url: 'https://www.nextinpact.com/rss',
    color: '#00a550',
    priority: 1
  },
  {
    name: 'Clubic',
    url: 'https://www.clubic.com/feed/rss',
    color: '#ff4500',
    priority: 2
  },
  {
    name: 'Presse-Citron',
    url: 'https://presse-citron.net/feed/',
    color: '#f7c948',
    priority: 2
  }
];

const MAX_ARTICLES_PER_SOURCE = 50;
const FEED_PATH = path.join(__dirname, 'feed.json');

async function fetchFeed(feedConfig, retryCount = 0) {
  const timeoutMs = 4000; // 4 secondes timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeoutMs);
  });

  try {
    console.log(`⏳ Fetching: ${feedConfig.name}...`);
    const feedPromise = parser.parseURL(feedConfig.url);
    const feed = await Promise.race([feedPromise, timeoutPromise]);
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
    if (retryCount < 1 && feedConfig.priority === 1) {
      console.log(`🔄 Retry ${feedConfig.name}...`);
      return fetchFeed(feedConfig, 1);
    }
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
  const startTime = Date.now();
  const maxTotalTime = 60000; // 60 secondes max pour tout le processus
  
  // Trier par priorité
  const sortedFeeds = [...RSS_FEEDS].sort((a, b) => a.priority - b.priority);
  
  for (const feedConfig of sortedFeeds) {
    // Vérifier le temps total
    if (Date.now() - startTime > maxTotalTime) {
      console.log('⏰ Timeout global atteint, sauvegarde des articles récupérés...');
      break;
    }
    
    const articles = await fetchFeed(feedConfig);
    allArticles.push(...articles);
    await new Promise(resolve => setTimeout(resolve, 300)); // Réduit de 500 à 300ms
  }
  
  const uniqueArticles = deduplicate(allArticles);
  const sortedArticles = sortByDate(uniqueArticles);
  
  const feedData = {
    lastUpdated: new Date().toISOString(),
    totalArticles: sortedArticles.length,
    articles: sortedArticles.slice(0, 200) // Limiter à 200 articles max
  };
  
  fs.writeFileSync(FEED_PATH, JSON.stringify(feedData, null, 2), 'utf8');
  
  console.log(`\n✅ Terminé ! ${sortedArticles.length} articles sauvegardés dans feed.json`);
  console.log(`📅 Dernière mise à jour: ${feedData.lastUpdated}`);
  console.log(`⏱️ Temps total: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});