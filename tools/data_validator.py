"""Validation et sanitization des donnees d'entree."""
import logging
import re
from typing import Any, Dict

logger = logging.getLogger(__name__)


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Nettoie une chaine de caracteres.

    Args:
        value: Chaine a nettoyer.
        max_length: Longueur maximale.

    Returns:
        Chaine nettoyee.
    """
    if not isinstance(value, str):
        return ""
    clean = re.sub(r"<[^>]+>", "", value)
    clean = re.sub(r"[\x00-\x1f]", "", clean)
    return clean.strip()[:max_length]


def validate_url(url: str) -> bool:
    """Valide qu'une URL est bien formee.

    Args:
        url: URL a valider.

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