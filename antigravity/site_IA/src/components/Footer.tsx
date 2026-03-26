export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} IA Actualités. Tous droits réservés.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 md:mt-0">
          Agrégateur d'actualités 100% francophone propulsé par l'Intelligence Artificielle.
        </p>
      </div>
    </footer>
  );
}
