import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    seoTitle: string | null;
    summary: string;
    source: string;
    category: string | null;
    imageUrl: string | null;
    publishedAt: Date;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/article/${article.slug}`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {article.imageUrl ? (
        <div className="w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <span className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-500/30 to-purple-500/30">IA</span>
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            {article.category || 'Tech'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: fr })}
          </span>
        </div>
        
        <h3 className="font-bold text-xl leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {article.seoTitle || article.title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 flex-grow">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            {article.source}
          </span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            Lire la suite &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
