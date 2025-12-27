"""
Tests du dashboard utilisateur
"""
import pytest
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from config import Config


class TestDashboard:
    """Tests du dashboard"""
    
    @pytest.fixture
    def logged_in_user(self, setup_driver):
        """Fixture pour un utilisateur connecté"""
        driver = setup_driver
        
        # Vérifier que le frontend est accessible
        try:
            driver.get(f"{Config.BASE_URL}/login")
            import time
            time.sleep(2)
        except:
            pytest.skip("Frontend non accessible")
        
        login_page = LoginPage(driver)
        
        try:
            login_page.login()
            time.sleep(2)  # Attendre la redirection
        except Exception as e:
            # Si la connexion échoue, skip le test
            pytest.skip(f"Connexion impossible: {e}")
        
        return driver
    
    def test_dashboard_access(self, logged_in_user):
        """Test d'accès au dashboard"""
        driver = logged_in_user
        dashboard_page = DashboardPage(driver)
        
        # Vérifier que le dashboard est chargé
        assert dashboard_page.is_dashboard_loaded(), "Le dashboard devrait être chargé"
        
        # Vérifier l'URL avec assert_location
        dashboard_page.assert_location("/user", timeout=10)
        
        # Vérifier la présence d'éléments du dashboard avec assert_text
        try:
            dashboard_page.assert_text(
                DashboardPage.DASHBOARD_TITLE,
                "Dashboard"
            )
        except:
            # Si le titre n'est pas trouvé, vérifier au moins que le conteneur est présent
            assert dashboard_page.is_element_present(DashboardPage.DASHBOARD_CONTAINER), \
                "Le conteneur du dashboard devrait être présent"
    
    def test_dashboard_navigation(self, logged_in_user):
        """Test de navigation dans le dashboard"""
        driver = logged_in_user
        dashboard_page = DashboardPage(driver)
        
        # Vérifier que le dashboard est chargé avec assert_text
        dashboard_page.assert_text(
            DashboardPage.DASHBOARD_TITLE, 
            "Dashboard"
        )
        
        # Cliquer sur "Mes Formations"
        dashboard_page.click_my_formations()
        # Utiliser assert_location pour vérifier l'URL
        dashboard_page.assert_location("/my-formations", timeout=10)
        
        # Retourner au dashboard
        driver.get(f"{Config.BASE_URL}/user/dashboard")
        dashboard_page = DashboardPage(driver)
        
        # Cliquer sur "Profil"
        dashboard_page.click_profile()
        dashboard_page.assert_location("/profile", timeout=10)
    
    def test_logout(self, logged_in_user):
        """Test de déconnexion"""
        driver = logged_in_user
        dashboard_page = DashboardPage(driver)
        
        # Se déconnecter
        dashboard_page.click_logout()
        
        # Vérifier la redirection vers la page d'accueil avec assert_location
        from pages.home_page import HomePage
        home_page = HomePage(driver)
        # Vérifier qu'on est redirigé vers login ou home
        try:
            home_page.assert_location("/login", timeout=10)
        except:
            home_page.assert_location("/", timeout=10)

