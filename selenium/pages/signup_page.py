"""
Page Object pour la page d'inscription
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from pages.base_page import BasePage


class SignupPage(BasePage):
    """Page d'inscription"""
    
    # Locators
    FULL_NAME_INPUT = (By.ID, "fullName")
    ROLE_SELECT = (By.ID, "role")
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    CONFIRM_PASSWORD_INPUT = (By.ID, "confirmPassword")
    ACCEPT_TERMS_CHECKBOX = (By.CSS_SELECTOR, "input[formControlName='acceptTerms'], input#acceptTerms")
    ACCEPT_TERMS_LABEL = (By.CSS_SELECTOR, "label.checkbox-label")
    SIGNUP_BUTTON = (By.CSS_SELECTOR, "button[type='submit'].btn-primary, button.btn-submit")
    SUCCESS_MESSAGE = (By.CSS_SELECTOR, ".alert-success")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".alert-error, .error-message")
    LOGIN_LINK = (By.XPATH, "//a[@routerLink='/login' or contains(@href, 'login')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.navigate_to("/signup")
    
    def enter_full_name(self, full_name):
        """Entrer le nom complet"""
        self.send_keys(self.FULL_NAME_INPUT, full_name)
    
    def select_role(self, role):
        """Sélectionner le rôle (USER, TRAINER, ADMIN)"""
        try:
            select_element = self.find_element(self.ROLE_SELECT, timeout=10)
            select = Select(select_element)
            select.select_by_value(role)
            # Attendre un peu pour que l'interface se mette à jour
            import time
            time.sleep(0.5)
        except Exception as e:
            # Fallback: utiliser JavaScript
            select_element = self.driver.find_element(By.ID, "role")
            self.driver.execute_script(f"arguments[0].value = '{role}'; arguments[0].dispatchEvent(new Event('change'));", select_element)
    
    def enter_email(self, email):
        """Entrer l'email"""
        self.send_keys(self.EMAIL_INPUT, email)
    
    def enter_password(self, password):
        """Entrer le mot de passe"""
        self.send_keys(self.PASSWORD_INPUT, password)
    
    def enter_confirm_password(self, password):
        """Confirmer le mot de passe"""
        self.send_keys(self.CONFIRM_PASSWORD_INPUT, password)
    
    def accept_terms(self):
        """Accepter les conditions"""
        # Essayer de trouver le checkbox directement
        try:
            checkbox = self.find_element(self.ACCEPT_TERMS_CHECKBOX, timeout=5)
            if not checkbox.is_selected():
                # Utiliser JavaScript pour cliquer car c'est un checkbox personnalisé
                self.driver.execute_script("arguments[0].click();", checkbox)
        except:
            # Si le checkbox n'est pas trouvé, essayer de cliquer sur le label
            try:
                label = self.find_element(self.ACCEPT_TERMS_LABEL, timeout=5)
                self.driver.execute_script("arguments[0].click();", label)
            except:
                # Dernière tentative: trouver le checkbox par son ID
                checkbox = self.driver.find_element(By.ID, "acceptTerms")
                self.driver.execute_script("arguments[0].click();", checkbox)
    
    def click_signup_button(self):
        """Cliquer sur le bouton d'inscription"""
        self.click_element(self.SIGNUP_BUTTON)
    
    def signup(self, full_name, role, email, password, confirm_password=None, accept_terms=True):
        """Méthode complète d'inscription"""
        self.enter_full_name(full_name)
        self.select_role(role)
        self.enter_email(email)
        self.enter_password(password)
        self.enter_confirm_password(confirm_password or password)
        
        if accept_terms:
            self.accept_terms()
        
        self.click_signup_button()
    
    def is_success_message_displayed(self):
        """Vérifier si un message de succès est affiché"""
        return self.is_element_visible(self.SUCCESS_MESSAGE)
    
    def is_error_message_displayed(self):
        """Vérifier si un message d'erreur est affiché"""
        return self.is_element_visible(self.ERROR_MESSAGE)
    
    def get_error_message(self):
        """Obtenir le message d'erreur"""
        if self.is_error_message_displayed():
            return self.get_text(self.ERROR_MESSAGE)
        return None
    
    def click_login_link(self):
        """Cliquer sur le lien de connexion"""
        self.click_element(self.LOGIN_LINK)
    
    def is_signup_button_enabled(self):
        """Vérifier si le bouton d'inscription est activé"""
        button = self.find_element(self.SIGNUP_BUTTON)
        return button.is_enabled()

