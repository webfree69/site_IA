"""Générateur de HTML statique à partir de templates simples."""
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
