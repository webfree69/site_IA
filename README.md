# 🤖 Site IA — Actualités Intelligence Artificielle

Site web auto-alimenté sur l'actualité de l'Intelligence Artificielle, hébergé sur GitHub Pages.

## 🌐 Accès

**URL :** https://webfree69.github.io/site_IA

## ⚙️ Fonctionnalités

- 📡 Collecte automatique de 10 sources RSS francophones (Numerama, Frandroid, Journal du Geek, 01net, Le Monde Informatique, Next Inpact, L'Usine Digitale, Siècle Digital, Clubic, BFMTV Tech)
- 🔄 Mise à jour quotidienne à 06h00 UTC via GitHub Actions
- 🎨 Design dark mode professionnel avec animations CSS
- 🔍 Recherche en temps réel et filtres par source
- 📱 Responsive (mobile, tablet, desktop)

## 🛠️ Stack

- **Frontend** : HTML, CSS, Vanilla JS
- **Backend** : Node.js (fetch RSS)
- **CI/CD** : GitHub Actions
- **Hébergement** : GitHub Pages

## 🚀 Déploiement

Le site se déploie automatiquement via GitHub Actions à chaque push sur `main`.

## 📦 Structure

```
site_IA/
├── index.html          # Page principale
├── style.css           # Styles CSS
├── app.js              # Logique frontend
├── fetch-news.js       # Script de récupération RSS
├── feed.json           # Données des articles
├── package.json        # Dépendances Node.js
└── .github/workflows/
    └── deploy.yml      # Workflow GitHub Actions