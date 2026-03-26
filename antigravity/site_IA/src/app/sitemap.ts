import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://site-ia.example.com';
  
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
      publishedAt: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  const articleEntries: MetadataRoute.Sitemap = articles.map((article: any) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: 'never',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    ...articleEntries,
  ]
}
