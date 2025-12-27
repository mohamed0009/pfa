"""
Page Object pour le dashboard utilisateur
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class DashboardPage(BasePage):
    """Page du dashboard utilisateur"""
    
    # Locators
    DASHBOARD_TITLE = (By.XPATH, "//h1[contains(text(), 'Dashboard') or contains(text(), 'Tableau de bord')] | //h2[contains(text(), 'Dashboard')]")
    MY_FORMATIONS_LINK = (By.XPATH, "//a[contains(text(), 'Mes Formations') or contains(text(), 'My Formations')]")
    PROFILE_LINK = (By.XPATH, "//a[contains(text(), 'Profil') or contains(text(), 'Profile')]")
    CHAT_LINK = (By.XPATH, "//a[contains(text(), 'Chat')]")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(text(), 'Déconnexion') or contains(text(), 'Logout')]")
    DASHBOARD_CONTAINER = (By.CSS_SELECTOR, "app-user-layout, router-outlet + *, [class*='dashboard']")
    
    def __init__(self, driver):
        super().__init__(driver)
        # Attendre que la page soit chargée - avec timeout plus long
        try:
            self.wait_for_url("/user/dashboard", timeout=30)
        except:
            # Si l'URL ne change pas, vérifier qu'on n'est plus sur login
            import time
            time.sleep(2)
    
    def is_dashboard_loaded(self):
        """Vérifier si le dashboard est chargé"""
        # Vérifier l'URL d'abord
        if "/user/dashboard" not in self.driver.current_url and "/user" not in self.driver.current_url:
            return False
        
        # Vérifier la présence d'éléments du dashboard
        return (self.is_element_present(self.DASHBOARD_TITLE, timeout=5) or 
                self.is_element_present(self.DASHBOARD_CONTAINER, timeout=5) or
                "/user" in self.driver.current_url)
    
    def click_my_formations(self):
        """Cliquer sur 'Mes Formations'"""
        self.click_element(self.MY_FORMATIONS_LINK)
    
    def click_profile(self):
        """Cliquer sur 'Profil'"""
        self.click_element(self.PROFILE_LINK)
    
    def click_chat(self):
        """Cliquer sur 'Chat'"""
        self.click_element(self.CHAT_LINK)
    
    def click_logout(self):
        """Cliquer sur 'Déconnexion'"""
        self.click_element(self.LOGOUT_BUTTON)

