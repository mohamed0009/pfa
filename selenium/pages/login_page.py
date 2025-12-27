"""
Page Object pour la page de connexion
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import Config


class LoginPage(BasePage):
    """Page de connexion"""
    
    # Locators
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    REMEMBER_ME_CHECKBOX = (By.CSS_SELECTOR, "input[formControlName='rememberMe']")
    LOGIN_BUTTON = (By.CSS_SELECTOR, "button[type='submit'].btn-primary, button.btn-submit")
    LOGIN_BUTTON_TEXT = (By.XPATH, "//button[@type='submit']//span[contains(text(), 'Se Connecter')]")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".alert-error, .error-message")
    SIGNUP_LINK = (By.XPATH, "//a[@routerLink='/signup' or contains(@href, 'signup')]")
    FORGOT_PASSWORD_LINK = (By.XPATH, "//a[contains(text(), 'Mot de passe oublié')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.navigate_to("/login")
    
    def enter_email(self, email):
        """Entrer l'email"""
        self.send_keys(self.EMAIL_INPUT, email)
    
    def enter_password(self, password):
        """Entrer le mot de passe"""
        self.send_keys(self.PASSWORD_INPUT, password)
    
    def click_remember_me(self):
        """Cocher 'Se souvenir de moi'"""
        checkbox = self.find_element(self.REMEMBER_ME_CHECKBOX)
        if not checkbox.is_selected():
            checkbox.click()
    
    def click_login_button(self):
        """Cliquer sur le bouton de connexion"""
        self.click_element(self.LOGIN_BUTTON)
    
    def login(self, email=None, password=None, remember_me=False):
        """Méthode complète de connexion"""
        email = email or Config.TEST_USER_EMAIL
        password = password or Config.TEST_USER_PASSWORD
        
        self.enter_email(email)
        self.enter_password(password)
        
        if remember_me:
            self.click_remember_me()
        
        self.click_login_button()
        
        # Attendre que la redirection soit complète (vers dashboard ou autre page user)
        try:
            self.wait_for_url("/user", timeout=15)
        except:
            # Si la redirection ne se fait pas, vérifier qu'on n'est plus sur login
            import time
            time.sleep(3)
            if "/login" in self.driver.current_url:
                raise Exception("La connexion a échoué - toujours sur la page de login")
    
    def is_error_message_displayed(self):
        """Vérifier si un message d'erreur est affiché"""
        return self.is_element_visible(self.ERROR_MESSAGE)
    
    def get_error_message(self):
        """Obtenir le message d'erreur"""
        if self.is_error_message_displayed():
            return self.get_text(self.ERROR_MESSAGE)
        return None
    
    def click_signup_link(self):
        """Cliquer sur le lien d'inscription"""
        self.click_element(self.SIGNUP_LINK)
    
    def is_login_button_enabled(self):
        """Vérifier si le bouton de connexion est activé"""
        button = self.find_element(self.LOGIN_BUTTON)
        return button.is_enabled()

