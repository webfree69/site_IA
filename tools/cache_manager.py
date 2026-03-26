"""Gestionnaire de cache avec TTL pour localStorage."""
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
