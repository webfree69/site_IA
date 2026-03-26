"use client";

import { useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import { Search as SearchIcon } from "lucide-react";

export default function SearchClient({ 
  initialArticles, 
  categories 
}: { 
  initialArticles: any[], 
  categories: string[] 
}) {
  const [query, setQuery] = useState("");
  const [categoryStr, setCategoryStr] = useState("");

  const filteredArticles = initialArticles.filter(article => {
    let matchQuery = true;
    let matchCat = true;

    if (query) {
      const lowerQ = query.toLowerCase();
      matchQuery = 
        (article.title?.toLowerCase().includes(lowerQ)) ||
        (article.summary?.toLowerCase().includes(lowerQ)) ||
        (article.keywords?.toLowerCase().includes(lowerQ));
    }

    if (categoryStr) {
      matchCat = article.category === categoryStr;
    }

    return matchQuery && matchCat;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Recherche
        </h1>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: ChatGPT, OpenAI..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <select 
            value={categoryStr}
            onChange={(e) => setCategoryStr(e.target.value)}
            className="block w-full sm:w-auto py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {query || categoryStr ? (
        <p className="text-slate-600 dark:text-slate-400">
          {filteredArticles.length} résultat(s) trouvé(s) 
          {query ? ` pour "${query}"` : ''}
          {categoryStr ? ` dans la catégorie "${categoryStr}"` : ''}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((article: any) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      
      {filteredArticles.length === 0 && (
         <div className="text-center py-20 text-slate-500">
             <p className="text-lg">Aucun article ne correspond à votre recherche.</p>
         </div>
      )}
    </div>
  );
}
