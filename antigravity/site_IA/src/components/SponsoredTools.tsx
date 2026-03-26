import { ExternalLink, Star } from "lucide-react";

const SPONSORED_TOOLS = [
  { name: "Jasper AI", description: "Le meilleur rédacteur IA pour le marketing.", link: "#" },
  { name: "Midjourney", description: "Génération d'images artistiques de haute volée.", link: "#" }
];

export default function SponsoredTools() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-blue-100 dark:border-slate-700 h-full">
      <h3 className="flex items-center text-lg font-bold mb-4 text-slate-900 dark:text-white">
        <Star className="h-5 w-5 text-yellow-500 mr-2" />
        Outils IA Recommandés
      </h3>
      <div className="space-y-4">
        {SPONSORED_TOOLS.map(tool => (
          <a key={tool.name} href={tool.link} className="block group">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 group-hover:underline flex items-center">
                {tool.name}
                <ExternalLink className="h-3 w-3 ml-1" />
              </h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{tool.description}</p>
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center italic">Liens affiliés partenaires</p>
    </div>
  );
}
