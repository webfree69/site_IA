import { OpenAI } from 'openai';

// Assumes process.env.OPENAI_API_KEY is set
const openai = new OpenAI();

export interface GeneratedContent {
  summary: string;
  seoTitle: string;
  keywords: string;
  category: string;
}

export async function generateContent(title: string, content: string): Promise<GeneratedContent | null> {
  const prompt = `Voici un article sur la tech/IA.
Titre original : "${title}"
Contenu/Extraits : "${content.substring(0, 3000)}"

Ton rôle est en tant qu'expert en intelligence artificielle et journaliste TECH francophone.
Rédige une réponse JSON structurée avec :
1. "summary" : un résumé professionnel, clair et engageant de l'article (200-300 mots).
2. "seoTitle" : un titre optimisé pour le SEO (max 60 caractères), attirant.
3. "keywords" : une liste de 5 à 10 mots-clés séparés par des virgules.
4. "category" : la catégorie la plus appropriée (ex: IA générative, Robotique, Business, Éthique, Matériel).

Réponds uniquement avec le JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const resultText = response.choices[0].message.content;
    if (!resultText) return null;

    return JSON.parse(resultText) as GeneratedContent;
  } catch (error) {
    console.error('Error generating AI content:', error);
    return null;
  }
}
