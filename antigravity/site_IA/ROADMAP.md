# ROADMAP - V2 (Actualités IA)

## 🚀 Prochaines Étapes Prévues

### 1. Newsletter Quotidienne/Hebdomadaire
- Intégration de l'API Resend ou Mailchimp.
- Un script (CRON) qui compile les 5 meilleurs articles de la journée générés par l'IA.
- Envoi crypté et automatique aux abonnés de la base de données SQLite.

### 2. Notifications Push (Web Push)
- Ajout d'un Service Worker Next.js (PWA).
- Permission navigateur pour avertir d'un article « Breaking News ».

### 3. Topics Trendings et Tags
- IA affinant les tags en se basant sur la récurrence.
- Section "En Tendance : OpenAI" qui regroupe les articles par contexte global.

### 4. Monétisation Active (Bonus)
- **Programme d'affiliation IA** : Un composant `SponsoredTools` affiché aléatoirement recommandant des outils IA avec des liens affiliés.
- **Emplacements Google AdSense** : Intégration native des bannières pub avec un composant Next.js `AdBanner` respectant le CLS (Cumulative Layout Shift) en réservant de l'espace.
