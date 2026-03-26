"""Envoi de notifications multi-canal."""
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
