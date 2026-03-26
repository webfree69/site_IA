import { fetchArticles } from '../src/lib/scraper';
import { generateContent } from '../src/lib/ai';
import { prisma } from '../src/lib/prisma';
import * as cheerio from 'cheerio';

function extractImage(htmlContent: string) {
    if (!htmlContent) return null;
    const $ = cheerio.load(htmlContent);
    return $('img').attr('src') || null;
}

function generateSlug(text: string) {
    return text.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')                      // Replace chars
        .replace(/(^-|-$)+/g, '');                        // Clean ends
}

async function main() {
    console.log('Demarrage de la synchronisation...');
    
    const fetchStart = Date.now();
    const articles = await fetchArticles();
    console.log(`Trouve ${articles.length} articles potentiels en ${(Date.now() - fetchStart)/1000}s`);
    
    let newCount = 0;
    
    for (const article of articles) {
        try {
            const existing = await prisma.article.findUnique({
                where: { url: article.url }
            });
            
            if (existing) {
                console.log(`[PASS] Deja en base: ${article.url}`);
                continue;
            }
            
            console.log(`[PROCESS] Generation IA pour: ${article.title}`);
            const aiContent = await generateContent(article.title, article.content);
            
            if (!aiContent) {
                 console.log(`[ERREUR] Echec de generation IA pour: ${article.title}`);
                 continue;
            }
            
            let baseSlug = generateSlug(aiContent.seoTitle || article.title || 'article');
            let slug = baseSlug;
            let counter = 1;

            while (await prisma.article.findUnique({ where: { slug } })) {
              slug = `${baseSlug}-${counter}`;
              counter++;
            }
            
            const imageUrl = extractImage(article.content);
            
            await prisma.article.create({
              data: {
                title: article.title,
                seoTitle: aiContent.seoTitle,
                slug,
                summary: aiContent.summary,
                content: article.content,
                url: article.url,
                imageUrl,
                source: article.source,
                category: aiContent.category,
                keywords: aiContent.keywords,
                publishedAt: article.publishedAt,
              }
            });
            
            console.log(`[SUCCES] Sauvegarde: ${article.title}`);
            newCount++;
            
        } catch(error) {
             console.error(`Erreur majeure pour l'article ${article.url}`, error);
        }
    }
    
    console.log(`Synchronisation terminee. Ajoute ${newCount} nouveaux articles.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
