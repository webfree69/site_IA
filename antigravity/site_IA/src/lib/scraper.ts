import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description']
  }
});

export const SOURCES = [
  { name: 'Korben', url: 'https://korben.info/categories/intelligence-artificielle/feed' },
  { name: 'Le Monde', url: 'https://www.lemonde.fr/pixels/rss_full.xml' }, // Using general tech feeds if specific not available, filtering will handle it
  { name: 'Les Numériques', url: 'https://www.lesnumeriques.com/rss.xml' },
  { name: 'Radio-Canada Tech', url: 'https://ici.radio-canada.ca/rss/1000518' },
  { name: 'La Presse Tech', url: 'https://www.lapresse.ca/techno/rss' },
  { name: 'RTBF Tech', url: 'https://www.rtbf.be/rss/tech.xml' }
];

export async function fetchArticles() {
  const allArticles = [];
  
  for (const source of SOURCES) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      for (const item of feed.items) {
        // Filter by keywords (IA focus)
        const keywords = ['ia', 'intelligence artificielle', 'machine learning', 'deep learning', 'chatgpt', 'openai', 'llm', 'claude', 'gemini', 'midjourney'];
        const textToSearch = `${item.title} ${item.content} ${item.contentSnippet || ''} ${item.categories?.join(' ') || ''}`.toLowerCase();
        
        // Ensure " ia " with spaces or word boundaries to avoid matching words like "via"
        const isRelated = keywords.some(kw => {
           if (kw === 'ia') {
               return /\bia\b/i.test(textToSearch);
           }
           return textToSearch.includes(kw);
        });
        
        if (isRelated) {
          allArticles.push({
            title: item.title || '',
            url: item.link || '',
            content: item['content:encoded'] || item.content || item.description || item.contentSnippet || '',
            source: source.name,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date()
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching feed ${source.url}:`, error);
    }
  }
  
  return allArticles;
}
