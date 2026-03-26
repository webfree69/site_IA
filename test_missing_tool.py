#!/usr/bin/env python3
"""
test_missing_tool.py — Détecteur et créateur automatique d'outils manquants
Conforme au skill Self-Tool-Creator (.clinerules)
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
BASE_DIR = Path(__file__).parent
TOOLS_DIR = BASE_DIR / "tools"
MEMORY_BANK = BASE_DIR / "memory-bank"
TOOLS_REGISTRY = MEMORY_BANK / "tools-registry.md"

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════
# OUTILS REQUIS PAR LE PROJET
# ═══════════════════════════════════════════════════════════════
REQUIRED_TOOLS = {
    "rss_parser": {
        "description": "Parseur de flux RSS avec support multi-sources",
        "inputs": "url: str, proxy: Optional[str]",
        "output": "List[Dict[str, str]]",
        "template": '''"""Parseur de flux RSS multi-sources."""
import logging
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional
from urllib.request import urlopen, Request
from urllib.error import URLError

logger = logging.getLogger(__name__)


def parse_rss(url: str, proxy: Optional[str] = None, timeout: int = 15) -> List[Dict[str, str]]:
    """Parse un flux RSS et retourne les articles.

    Args:
        url: URL du flux RSS.
        proxy: Proxy CORS optionnel.
        timeout: Timeout en secondes.

    Returns:
        Liste de dictionnaires avec title, link, description, pubDate, image.

    Raises:
        URLError: Si le fetch échoue.
        ET.ParseError: Si le XML est invalide.
    """
    try:
        full_url = f"{proxy}{url}" if proxy else url
        req = Request(full_url, headers={"User-Agent": "NewsFlow/1.0"})
        with urlopen(req, timeout=timeout) as resp:
            xml_data = resp.read().decode("utf-8", errors="replace")

        root = ET.fromstring(xml_data)
        articles = []

        # RSS 2.0
        for item in root.iter("item"):
            article = {
                "title": (item.findtext("title") or "").strip(),
                "link": (item.findtext("link") or "").strip(),
                "description": (item.findtext("description") or "").strip()[:500],
                "pubDate": (item.findtext("pubDate") or "").strip(),
                "image": "",
            }
            enclosure = item.find("enclosure")
            if enclosure is not None:
                article["image"] = enclosure.get("url", "")
            if article["title"]:
                articles.append(article)

        # Atom fallback
        if not articles:
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            for entry in root.findall(".//atom:entry", ns):
                article = {
                    "title": (entry.findtext("atom:title", namespaces=ns) or "").strip(),
                    "link": "",
                    "description": (entry.findtext("atom:summary", namespaces=ns) or "").strip()[:500],
                    "pubDate": (entry.findtext("atom:published", namespaces=ns) or "").strip(),
                    "image": "",
                }
                link_el = entry.find("atom:link", ns)
                if link_el is not None:
                    article["link"] = link_el.get("href", "")
                if article["title"]:
                    articles.append(article)

        logger.info({"action": "parse_rss", "url": url, "articles": len(articles)})
        return articles

    except (URLError, ET.ParseError) as e:
        logger.error({"action": "parse_rss", "url": url, "error": str(e)})
        return []
'''
    },
    "cache_manager": {
        "description": "Gestionnaire de cache localStorage avec TTL",
        "inputs": "key: str, data: Any, ttl: int",
        "output": "Optional[Any]",
        "template": '''"""Gestionnaire de cache avec TTL pour localStorage."""
import logging
import json
import time
from typing import Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).parent.parent / ".cache"


def get_cache(key: str, ttl: int = 300) -> Optional[Any]:
    """Récupère une valeur du cache si elle n'a pas expiré.

    Args:
        key: Clé de cache.
        ttl: Time-to-live en secondes (défaut: 5 min).

    Returns:
        Données cachées ou None si expiré/inexistant.
    """
    try:
        CACHE_DIR.mkdir(exist_ok=True)
        cache_file = CACHE_DIR / f"{key}.json"
        if not cache_file.exists():
            return None

        raw = json.loads(cache_file.read_text(encoding="utf-8"))
        if time.time() - raw.get("ts", 0) > ttl:
            cache_file.unlink(missing_ok=True)
            return None

        logger.info({"action": "get_cache", "key": key, "status": "hit"})
        return raw.get("data")

    except (json.JSONDecodeError, OSError) as e:
        logger.warning({"action": "get_cache", "key": key, "error": str(e)})
        return None


def set_cache(key: str, data: Any) -> None:
    """Sauvegarde des données dans le cache.

    Args:
        key: Clé de cache.
        data: Données à sauvegarder.
    """
    try:
        CACHE_DIR.mkdir(exist_ok=True)
        cache_file = CACHE_DIR / f"{key}.json"
        payload = {"data": data, "ts": time.time()}
        cache_file.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        logger.info({"action": "set_cache", "key": key, "status": "saved"})
    except (TypeError, OSError) as e:
        logger.error({"action": "set_cache", "key": key, "error": str(e)})


def clear_cache() -> int:
    """Supprime tous les fichiers de cache.

    Returns:
        Nombre de fichiers supprimés.
    """
    count = 0
    try:
        CACHE_DIR.mkdir(exist_ok=True)
        for f in CACHE_DIR.glob("*.json"):
            f.unlink(missing_ok=True)
            count += 1
        logger.info({"action": "clear_cache", "deleted": count})
    except OSError as e:
        logger.error({"action": "clear_cache", "error": str(e)})
    return count
'''
    },
    "html_generator": {
        "description": "Générateur de HTML statique à partir de templates",
        "inputs": "template: str, context: Dict",
        "output": "str",
        "template": '''"""Générateur de HTML statique à partir de templates simples."""
import logging
import re
from typing import Dict, Any

logger = logging.getLogger(__name__)


def render_template(template: str, context: Dict[str, Any]) -> str:
    """Remplace les variables {{key}} dans un template.

    Args:
        template: Chaîne de template avec {{key}}.
        context: Dictionnaire de valeurs.

    Returns:
        HTML rendu avec les variables remplacées.
    """
    result = template
    for key, value in context.items():
        result = result.replace(f"{{{{{key}}}}}", str(value))
    logger.info({"action": "render_template", "vars": len(context)})
    return result


def generate_card_html(article: Dict[str, str], theme_color: str = "#2196F3") -> str:
    """Génère le HTML d'une card d'article.

    Args:
        article: Dict avec title, link, description, source, image.
        theme_color: Couleur hex du thème.

    Returns:
        HTML de la card.
    """
    title = article.get("title", "Sans titre")
    link = article.get("link", "#")
    desc = article.get("description", "")[:200]
    source = article.get("source", "Inconnu")
    image = article.get("image", "")

    img_html = f'<img src="{image}" alt="" loading="lazy" onerror="this.style.display=\'none\'">' if image else ""

    return f"""<article class="card" style="border-left: 3px solid {theme_color}">
  {img_html}
  <div class="card-body">
    <h3><a href="{link}" target="_blank" rel="noopener">{title}</a></h3>
    <p class="desc">{desc}</p>
    <span class="source">{source}</span>
  </div>
</article>"""
'''
    },
    "notification_sender": {
        "description": "Envoi de notifications (toast, browser, console)",
        "inputs": "title: str, message: str, level: str",
        "output": "bool",
        "template": '''"""Envoi de notifications multi-canal."""
import logging
from typing import Literal
from datetime import datetime

logger = logging.getLogger(__name__)

Level = Literal["info", "success", "warning", "error"]


def send_notification(title: str, message: str, level: Level = "info") -> bool:
    """Envoie une notification loggée.

    Args:
        title: Titre de la notification.
        message: Corps du message.
        level: Niveau (info, success, warning, error).

    Returns:
        True si envoyé avec succès.
    """
    timestamp = datetime.now().isoformat()
    log_entry = {
        "action": "notification",
        "title": title,
        "message": message,
        "level": level,
        "timestamp": timestamp,
    }

    if level == "error":
        logger.error(log_entry)
    elif level == "warning":
        logger.warning(log_entry)
    else:
        logger.info(log_entry)

    return True


def format_toast_js(title: str, message: str, duration: int = 5000) -> str:
    """Génère le JavaScript pour afficher un toast dans le navigateur.

    Args:
        title: Titre du toast.
        message: Message du toast.
        duration: Durée d'affichage en ms.

    Returns:
        Code JavaScript à injecter.
    """
    return f"""
(function() {{
  var toast = document.createElement('div');
  toast.className = 'toast toast-{level}';
  toast.innerHTML = '<strong>{title}</strong><br>{message}';
  toast.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:16px;background:#111827;color:#F9FAFB;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.4);animation:fadeIn .3s ease';
  document.body.appendChild(toast);
  setTimeout(function() {{ toast.remove(); }}, {duration});
}})();
"""
'''
    },
    "data_validator": {
        "description": "Validation et sanitization des données d'entrée",
        "inputs": "data: Dict, schema: Dict",
        "output": "Dict",
        "template": '''"""Validation et sanitization des données d'entrée."""
import logging
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Nettoie une chaîne de caractères.

    Args:
        value: Chaîne à nettoyer.
        max_length: Longueur maximale.

    Returns:
        Chaîne nettoyée.
    """
    if not isinstance(value, str):
        return ""
    # Supprime les balises HTML
    clean = re.sub(r"<[^>]+>", "", value)
    # Supprime les caractères de contrôle
    clean = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", clean)
    return clean.strip()[:max_length]


def validate_url(url: str) -> bool:
    """Valide qu'une URL est bien formée.

    Args:
        url: URL à valider.

    Returns:
        True si l'URL est valide.
    """
    pattern = re.compile(
        r"^https?://"
        r"(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+"
        r"[a-zA-Z]{2,}"
        r"(?::\d{1,5})?"
        r"(?:/[^\s]*)?$"
    )
    return bool(pattern.match(url))


def validate_article(article: Dict[str, Any]) -> Dict[str, Any]:
    """Valide et nettoie un article.

    Args:
        article: Dictionnaire d'article brut.

    Returns:
        Article nettoyé et validé.
    """
    cleaned = {
        "title": sanitize_string(article.get("title", ""), 300),
        "link": article.get("link", "").strip(),
        "description": sanitize_string(article.get("description", ""), 500),
        "source": sanitize_string(article.get("source", ""), 100),
        "image": article.get("image", "").strip(),
        "pubDate": article.get("pubDate", "").strip(),
    }

    if cleaned["link"] and not validate_url(cleaned["link"]):
        logger.warning({"action": "validate_article", "warning": "invalid_url", "url": cleaned["link"][:100]})
        cleaned["link"] = ""

    if cleaned["image"] and not validate_url(cleaned["image"]):
        cleaned["image"] = ""

    return cleaned
'''
    },
}


def check_missing_tools() -> List[str]:
    """Vérifie quels outils requis sont manquants."""
    missing = []
    TOOLS_DIR.mkdir(exist_ok=True)

    for tool_name in REQUIRED_TOOLS:
        tool_file = TOOLS_DIR / f"{tool_name}.py"
        if not tool_file.exists():
            missing.append(tool_name)
            logger.warning(f"❌ MANQUANT: {tool_name}.py")
        else:
            logger.info(f"✅ OK: {tool_name}.py")

    return missing


def create_tool(tool_name: str) -> bool:
    """Crée un outil manquant à partir du template.

    Args:
        tool_name: Nom de l'outil à créer.

    Returns:
        True si créé avec succès.
    """
    if tool_name not in REQUIRED_TOOLS:
        logger.error(f"Template inconnu pour: {tool_name}")
        return False

    config = REQUIRED_TOOLS[tool_name]
    tool_file = TOOLS_DIR / f"{tool_name}.py"

    try:
        tool_file.write_text(config["template"], encoding="utf-8")
        logger.info(f"✅ CRÉÉ: {tool_file}")
        return True
    except OSError as e:
        logger.error(f"❌ ERREUR création {tool_name}: {e}")
        return False


def update_tools_registry() -> None:
    """Met à jour le registre des outils dans memory-bank."""
    MEMORY_BANK.mkdir(exist_ok=True)
    now = datetime.now().strftime("%d/%m/%Y %H:%M")

    lines = [
        "# Registre des Outils Créés Automatiquement\n",
        "## Template d'entrée",
        "### [nom-outil]",
        "- **Fichier** : tools/[nom].py",
        "- **Créé le** : [date]",
        "- **Rôle** : [description courte]",
        "- **Input** : [types]",
        "- **Output** : [type retour]",
        "- **Utilisé par** : [fichiers qui l'utilisent]\n",
        "## Outils disponibles\n",
    ]

    for tool_name, config in REQUIRED_TOOLS.items():
        tool_file = TOOLS_DIR / f"{tool_name}.py"
        status = "✅" if tool_file.exists() else "❌"
        lines.append(f"### {status} {tool_name}")
        lines.append(f"- **Fichier** : tools/{tool_name}.py")
        lines.append(f"- **Créé le** : {now}")
        lines.append(f"- **Rôle** : {config['description']}")
        lines.append(f"- **Input** : `{config['inputs']}`")
        lines.append(f"- **Output** : `{config['output']}`")
        lines.append("")

    TOOLS_REGISTRY.write_text("\n".join(lines), encoding="utf-8")
    logger.info(f"✅ Registre mis à jour: {TOOLS_REGISTRY}")


def main() -> None:
    """Point d'entrée principal."""
    logger.info("=" * 60)
    logger.info("🔍 TEST MISSING TOOL — Détection des outils manquants")
    logger.info("=" * 60)

    # Vérifier les outils manquants
    missing = check_missing_tools()

    if not missing:
        logger.info("\n✅ Tous les outils requis sont présents!")
        update_tools_registry()
        return

    logger.info(f"\n⚠️  {len(missing)} outil(s) manquant(s) détecté(s):")
    for name in missing:
        logger.info(f"   - {name}")

    # Créer les outils manquants
    logger.info("\n🛠️  Création automatique en cours...")
    created = 0
    for tool_name in missing:
        if create_tool(tool_name):
            created += 1

    # Mettre à jour le registre
    update_tools_registry()

    # Résumé
    logger.info("\n" + "=" * 60)
    logger.info(f"📊 RÉSUMÉ: {created}/{len(missing)} outils créés")
    logger.info("=" * 60)

    if created == len(missing):
        logger.info("✅ TOUS LES OUTILS ONT ÉTÉ CRÉÉS AVEC SUCCÈS!")
    else:
        logger.warning(f"⚠️  {len(missing) - created} outil(s) n'ont pas pu être créés")
        sys.exit(1)


if __name__ == "__main__":
    main()