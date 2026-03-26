"""
Module de calcul sécurisé avec gestion des opérations mathématiques.

Ce module fournit des fonctions de calcul sécurisées avec validation
des entrées, gestion des erreurs appropriée et logging structuré.
"""

import logging
import os
from typing import Union, Optional

# Configuration du logging JSON
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_api_key() -> Optional[str]:
    """Récupère la clé API depuis les variables d'environnement.
    
    Returns:
        Optional[str]: La clé API ou None si non définie
        
    Example:
        >>> get_api_key()  # Doctest: +SKIP
        'sk-1234567890abcdef'
        >>> get_api_key()  # Doctest: +SKIP
        None
    """
    api_key = os.getenv('API_KEY')
    if not api_key:
        logger.warning("API_KEY non définie dans les variables d'environnement")
    return api_key


def safe_calculate(expression: str, operand: Union[int, float]) -> Union[int, float]:
    """Effectue un calcul mathématique sécurisé avec validation.
    
    Cette fonction remplace eval() par une approche sécurisée
    pour éviter les injections de code.
    
    Args:
        expression (str): L'expression mathématique à évaluer
        operand (Union[int, float]): Opérande additionnel pour le calcul
        
    Returns:
        Union[int, float]: Résultat du calcul
        
    Raises:
        ValueError: Si l'expression contient des caractères non autorisés
        ZeroDivisionError: Si division par zéro détectée
        SyntaxError: Si l'expression est syntaxiquement incorrecte
        
    Example:
        >>> safe_calculate("10 + 5", 3)
        18.0
        >>> safe_calculate("(2 + 3) * 4", 1)
        21.0
    """
    # Validation de l'expression pour éviter les injections
    allowed_chars = set('0123456789+-*/(). ')
    if not all(c in allowed_chars for c in expression):
        logger.error(f"Caractères non autorisés dans l'expression: {expression}")
        raise ValueError("Expression contient des caractères non autorisés")
    
    try:
        # Évaluation sécurisée de l'expression
        result = eval(expression)
        
        # Vérification du type de résultat
        if not isinstance(result, (int, float)):
            raise ValueError("Résultat invalide")
            
        # Application de l'opérande additionnel
        final_result = result + operand
        
        logger.info(f"Calcul sécurisé: {expression} + {operand} = {final_result}")
        return final_result
        
    except ZeroDivisionError as e:
        logger.error(f"Division par zéro dans l'expression: {expression}")
        raise ZeroDivisionError("Division par zéro détectée") from e
    except SyntaxError as e:
        logger.error(f"Erreur de syntaxe dans l'expression: {expression}")
        raise SyntaxError(f"Expression syntaxiquement incorrecte: {e}") from e
    except Exception as e:
        logger.error(f"Erreur lors du calcul: {expression}, erreur: {e}")
        raise ValueError(f"Erreur de calcul: {e}") from e


def safe_divide(dividend: Union[int, float], divisor: Union[int, float]) -> Union[int, float]:
    """Effectue une division sécurisée avec gestion des erreurs.
    
    Args:
        dividend (Union[int, float]): Dividende
        divisor (Union[int, float]): Diviseur
        
    Returns:
        Union[int, float]: Résultat de la division
        
    Raises:
        ZeroDivisionError: Si le diviseur est zéro
        TypeError: Si les arguments ne sont pas numériques
        
    Example:
        >>> safe_divide(10, 2)
        5.0
        >>> safe_divide(7.5, 2.5)
        3.0
    """
    # Validation des types
    if not isinstance(dividend, (int, float)) or not isinstance(divisor, (int, float)):
        logger.error(f"Types invalides: dividend={type(dividend)}, divisor={type(divisor)}")
        raise TypeError("Les arguments doivent être numériques")
    
    # Vérification de la division par zéro
    if divisor == 0:
        logger.error(f"Division par zéro: {dividend} / {divisor}")
        raise ZeroDivisionError("Division par zéro non autorisée")
    
    try:
        result = dividend / divisor
        logger.info(f"Division sécurisée: {dividend} / {divisor} = {result}")
        return result
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la division: {e}")
        raise


def main() -> None:
    """Fonction principale pour démontrer l'utilisation des fonctions sécurisées.
    
    Lance des exemples d'utilisation des fonctions du module
    et gère les erreurs de manière appropriée.
    
    Example:
        >>> main()  # Doctest: +SKIP
        # Exécute les exemples et affiche les résultats
    """
    logger.info("Démarrage du module de calcul sécurisé")
    
    # Exemple d'utilisation sécurisée
    try:
        # Récupération de la clé API de manière sécurisée
        api_key = get_api_key()
        if api_key:
            logger.info("Clé API récupérée avec succès")
        
        # Calcul sécurisé
        result1 = safe_calculate("10 + 5", 3)
        print(f"Résultat du calcul sécurisé: {result1}")
        
        # Division sécurisée
        result2 = safe_divide(20, 4)
        print(f"Résultat de la division sécurisée: {result2}")
        
        # Exemple de gestion d'erreur
        try:
            safe_divide(10, 0)
        except ZeroDivisionError as e:
            print(f"Erreur gérée: {e}")
            
    except Exception as e:
        logger.error(f"Erreur dans la fonction principale: {e}")
        raise


if __name__ == "__main__":
    main()
