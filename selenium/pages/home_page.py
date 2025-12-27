"""
Page Object pour la page d'accueil
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class HomePage(BasePage):
    """Page d'accueil"""
    
    # Locators
    HEADER = (By.TAG_NAME, "app-header")
    HERO_SECTION = (By.TAG_NAME, "app-hero")
    SERVICES_SECTION = (By.TAG_NAME, "app-services")
    TESTIMONIALS_SECTION = (By.TAG_NAME, "app-testimonials")
    FOOTER = (By.TAG_NAME, "app-footer")
    LOGIN_LINK = (By.XPATH, "//button[contains(text(), 'Connexion')] | //a[contains(text(), 'Connexion') or contains(text(), 'Se Connecter') or contains(text(), 'Login')] | //button[@routerLink='/login']")
    SIGNUP_LINK = (By.XPATH, "//button[contains(text(), 'inscrire')] | //a[contains(text(), 'inscrire') or contains(text(), 'Créer un compte') or contains(text(), 'Sign Up')] | //button[@routerLink='/signup']")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.navigate_to("/")
    
    def is_header_present(self):
        """Vérifier la présence du header"""
        return self.is_element_present(self.HEADER)
    
    def is_hero_section_present(self):
        """Vérifier la présence de la section hero"""
        return self.is_element_present(self.HERO_SECTION)
    
    def is_services_section_present(self):
        """Vérifier la présence de la section services"""
        return self.is_element_present(self.SERVICES_SECTION)
    
    def is_testimonials_section_present(self):
        """Vérifier la présence de la section témoignages"""
        return self.is_element_present(self.TESTIMONIALS_SECTION)
    
    def is_footer_present(self):
        """Vérifier la présence du footer"""
        return self.is_element_present(self.FOOTER)
    
    def click_login_link(self):
        """Cliquer sur le lien de connexion"""
        self.click_element(self.LOGIN_LINK)
    
    def click_signup_link(self):
        """Cliquer sur le lien d'inscription"""
        self.click_element(self.SIGNUP_LINK)

