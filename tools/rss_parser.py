"""Parseur de flux RSS multi-sources."""
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
