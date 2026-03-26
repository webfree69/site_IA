import { prisma } from "@/lib/prisma";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const articlesDb = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  const articles = articlesDb.map((a: any) => ({
    ...a,
    publishedAt: a.publishedAt.toISOString(),
    createdAt: a.createdAt.toISOString(),
  }));

  const categoriesDb = await prisma.article.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  const categories = categoriesDb.map((c: any) => c.category).filter(Boolean) as string[];

  return <SearchClient initialArticles={articles} categories={categories} />;
}
