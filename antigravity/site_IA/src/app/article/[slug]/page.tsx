import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Tag } from "lucide-react";
import type { Metadata } from 'next';

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({ select: { slug: true } });
  return articles.map((a: any) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article) return {};

  return {
    title: `${article.seoTitle || article.title} | IA Actualités`,
    description: article.summary,
    keywords: article.keywords ? article.keywords.split(',').map((k: string) => k.trim()) : ['IA', 'Intelligence Artificielle'],
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug }
  });

  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.seoTitle || article.title,
    image: article.imageUrl ? [article.imageUrl] : [],
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.createdAt.toISOString(),
    description: article.summary,
    author: [{
      '@type': 'Organization',
      name: article.source,
      url: article.url
    }]
  };

  return (
    <article className="max-w-3xl mx-auto py-8 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux articles
      </Link>

      <header className="mb-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center">
             <Tag className="mr-1.5 h-4 w-4" />
             {article.category || 'Tech'}
          </span>
          <span>•</span>
          <span className="flex items-center">
            <Calendar className="mr-1.5 h-4 w-4" />
            {format(new Date(article.publishedAt), 'dd MMMM yyyy', { locale: fr })}
          </span>
          <span>•</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full font-medium">
            {article.source}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
          {article.title}
        </h1>
        
        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {article.summary}
        </p>
      </header>
      
      {article.imageUrl && (
        <div className="relative w-full h-64 md:h-96 mb-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
           <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-12 leading-loose">
         <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-slate-200 dark:border-slate-800">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/25"
        >
          Lire l'article original complet
          <ExternalLink className="ml-2 w-5 h-5" />
        </a>
      </div>
    </article>
  );
}
