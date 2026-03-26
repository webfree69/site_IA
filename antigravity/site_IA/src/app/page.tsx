import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";
import SponsoredTools from "@/components/SponsoredTools";

export const revalidate = 3600; // ISR validation every 1 hour

export default async function Home() {
  const articles = await prisma.article.findMany({
    orderBy: {
      publishedAt: 'desc'
    },
    take: 24
  });

  return (
    <div className="space-y-12">
      <section className="text-center max-w-4xl mx-auto py-12 md:py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          L'actu IA <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">100% Francophone</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Découvrez les dernières avancées, analyses et décryptages sur l'intelligence artificielle, le machine learning et la tech générative.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article: any, index: number) => (
          <div key={article.id} className="contents">
            <ArticleCard article={article} />
            {index === 1 && (
              <div className="col-span-1 md:block hidden">
                <SponsoredTools />
              </div>
            )}
            {index === 4 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <AdBanner />
              </div>
            )}
          </div>
        ))}
        {articles.length < 2 && (
             <div className="col-span-1">
                <SponsoredTools />
             </div>
        )}
      </div>
      
      {articles.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-lg">Aucun article trouvé.</p>
          <p className="text-sm">La synchronisation est peut-être en cours, repassez plus tard !</p>
        </div>
      )}
    </div>
  );
}
