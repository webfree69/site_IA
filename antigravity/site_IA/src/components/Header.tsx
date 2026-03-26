import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Bot } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">IA Actualités</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Accueil
          </Link>
          <Link href="/search" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Recherche
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
