import pytest
import os
from unittest.mock import patch, MagicMock
from test_sample import get_api_key, safe_calculate, safe_divide, main


class TestGetApiKey:
    """Tests pour la fonction get_api_key()"""
    
    def test_api_key_present(self):
        """Test du comportement normal avec clé API définie"""
        with patch.dict(os.environ, {'API_KEY': 'test-key-123'}):
            result = get_api_key()
            assert result == 'test-key-123'
    
    def test_api_key_absent(self):
        """Test avec clé API non définie"""
        with patch.dict(os.environ, {}, clear=True):
            result = get_api_key()
            assert result is None
    
    def test_api_key_empty(self):
        """Test avec clé API vide"""
        with patch.dict(os.environ, {'API_KEY': ''}):
            result = get_api_key()
            assert result == ''


class TestSafeCalculate:
    """Tests pour la fonction safe_calculate()"""
    
    def test_calcul_simple_valide(self):
        """Test d'un calcul simple valide"""
        result = safe_calculate("10 + 5", 3)
        assert result == 18  # (10 + 5) + 3
    
    def test_calcul_complexe_valide(self):
        """Test d'un calcul plus complexe valide"""
        result = safe_calculate("2 * 3 + 4", 1)
        assert result == 11  # (2 * 3 + 4) + 1
    
    def test_calcul_avec_parentheses(self):
        """Test d'un calcul avec parenthèses"""
        result = safe_calculate("(10 + 5) * 2", 0)
        assert result == 30  # (10 + 5) * 2 + 0
    
    def test_expression_invalide_caracteres(self):
        """Test avec caractères non autorisés"""
        with pytest.raises(ValueError, match="Expression contient des caractères non autorisés"):
            safe_calculate("10 + import os", 5)
    
    def test_expression_invalide_syntaxe(self):
        """Test avec expression syntaxiquement incorrecte"""
        with pytest.raises(SyntaxError, match="Expression syntaxiquement incorrecte"):
            safe_calculate("10 + + 5", 3)
    
    def test_division_par_zero(self):
        """Test avec division par zéro dans l'expression"""
        with pytest.raises(ZeroDivisionError, match="Division par zéro détectée"):
            safe_calculate("10 / 0", 5)
    
    def test_resultat_non_numerique(self):
        """Test avec expression retournant un non-numérique"""
        with pytest.raises(ValueError, match="Résultat invalide"):
            safe_calculate("'string'", 5)
    
    def test_operand_non_numerique(self):
        """Test avec opérande non numérique"""
        with pytest.raises(ValueError):
            safe_calculate("10 + 5", "invalid")


class TestSafeDivide:
    """Tests pour la fonction safe_divide()"""
    
    def test_division_normale(self):
        """Test d'une division normale"""
        result = safe_divide(10, 2)
        assert result == 5.0
    
    def test_division_avec_decimaux(self):
        """Test d'une division avec des décimaux"""
        result = safe_divide(7.5, 2.5)
        assert result == 3.0
    
    def test_division_par_zero(self):
        """Test de la division par zéro"""
        with pytest.raises(ZeroDivisionError, match="Division par zéro non autorisée"):
            safe_divide(10, 0)
    
    def test_dividende_zero(self):
        """Test avec dividende zéro"""
        result = safe_divide(0, 5)
        assert result == 0.0
    
    def test_types_invalides(self):
        """Test avec types invalides"""
        with pytest.raises(TypeError, match="Les arguments doivent être numériques"):
            safe_divide("10", 2)
        
        with pytest.raises(TypeError, match="Les arguments doivent être numériques"):
            safe_divide(10, "2")
    
    def test_division_negatives(self):
        """Test avec nombres négatifs"""
        result = safe_divide(-10, 2)
        assert result == -5.0
        
        result = safe_divide(10, -2)
        assert result == -5.0
        
        result = safe_divide(-10, -2)
        assert result == 5.0


class TestMain:
    """Tests pour la fonction main()"""
    
    @patch('test_sample.get_api_key')
    @patch('test_sample.safe_calculate')
    @patch('test_sample.safe_divide')
    @patch('test_sample.logger')
    def test_main_execution_normale(self, mock_logger, mock_safe_divide, mock_safe_calculate, mock_get_api_key):
        """Test de l'exécution normale de main()"""
        # Configuration des mocks
        mock_get_api_key.return_value = "test-key"
        mock_safe_calculate.return_value = 18
        mock_safe_divide.return_value = 5.0
        
        # Exécution de main()
        main()
        
        # Vérification des appels
        mock_get_api_key.assert_called_once()
        mock_safe_calculate.assert_called_once_with("10 + 5", 3)
        mock_safe_divide.assert_called_once_with(20, 4)
        mock_logger.info.assert_any_call("Démarrage du module de calcul sécurisé")
        mock_logger.info.assert_any_call("Clé API récupérée avec succès")
    
    @patch('test_sample.get_api_key')
    @patch('test_sample.safe_calculate')
    @patch('test_sample.safe_divide')
    @patch('test_sample.logger')
    def test_main_sans_api_key(self, mock_logger, mock_safe_divide, mock_safe_calculate, mock_get_api_key):
        """Test de main() sans clé API définie"""
        # Configuration des mocks
        mock_get_api_key.return_value = None
        mock_safe_calculate.return_value = 18
        mock_safe_divide.return_value = 5.0
        
        # Exécution de main()
        main()
        
        # Vérification que le warning est loggé
        mock_logger.warning.assert_called_once_with("API_KEY non définie dans les variables d'environnement")
    
    @patch('test_sample.get_api_key')
    @patch('test_sample.safe_calculate')
    @patch('test_sample.safe_divide')
    @patch('test_sample.logger')
    def test_main_avec_erreur_division(self, mock_logger, mock_safe_divide, mock_safe_calculate, mock_get_api_key):
        """Test de main() avec erreur de division gérée"""
        # Configuration des mocks
        mock_get_api_key.return_value = "test-key"
        mock_safe_calculate.return_value = 18
        mock_safe_divide.side_effect = [5.0, ZeroDivisionError("Division par zéro non autorisée")]
        
        # Exécution de main()
        main()
        
        # Vérification que l'erreur est gérée correctement
        assert mock_safe_divide.call_count == 2
        mock_logger.error.assert_called_with("Division par zéro: 10 / 0")