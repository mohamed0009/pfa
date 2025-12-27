"""
Page de base pour le Page Object Model
"""
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from config import Config


class BasePage:
    """Classe de base pour toutes les pages"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, Config.EXPLICIT_WAIT)
    
    def navigate_to(self, url):
        """Naviguer vers une URL"""
        self.driver.get(f"{Config.BASE_URL}{url}")
    
    def find_element(self, locator, timeout=None):
        """Trouver un élément avec wait"""
        wait = WebDriverWait(self.driver, timeout or Config.EXPLICIT_WAIT)
        return wait.until(EC.presence_of_element_located(locator))
    
    def find_elements(self, locator, timeout=None):
        """Trouver plusieurs éléments avec wait"""
        wait = WebDriverWait(self.driver, timeout or Config.EXPLICIT_WAIT)
        return wait.until(EC.presence_of_all_elements_located(locator))
    
    def click_element(self, locator):
        """Cliquer sur un élément avec plusieurs stratégies"""
        element = self.find_element(locator)
        self.wait.until(EC.element_to_be_clickable(locator))
        
        # Essayer de scroller vers l'élément
        try:
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            import time
            time.sleep(0.5)  # Attendre un peu après le scroll
        except:
            pass
        
        # Essayer de cliquer normalement
        try:
            element.click()
        except Exception:
            # Si le clic normal échoue, utiliser JavaScript
            try:
                self.driver.execute_script("arguments[0].click();", element)
            except Exception:
                # Dernière tentative: action chains
                from selenium.webdriver.common.action_chains import ActionChains
                ActionChains(self.driver).move_to_element(element).click().perform()
    
    def send_keys(self, locator, text):
        """Envoyer du texte dans un champ"""
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)
    
    def get_text(self, locator):
        """Obtenir le texte d'un élément"""
        element = self.find_element(locator)
        return element.text
    
    def is_element_present(self, locator, timeout=5):
        """Vérifier si un élément est présent"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False
    
    def is_element_visible(self, locator, timeout=5):
        """Vérifier si un élément est visible"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False
    
    def wait_for_url(self, url_pattern, timeout=None):
        """Attendre qu'une URL soit chargée"""
        wait = WebDriverWait(self.driver, timeout or Config.EXPLICIT_WAIT)
        return wait.until(EC.url_contains(url_pattern))
    
    def get_current_url(self):
        """Obtenir l'URL actuelle"""
        return self.driver.current_url
    
    def assert_text(self, locator, expected_text, timeout=None):
        """
        Vérifier que le texte d'un élément correspond au texte attendu
        
        Args:
            locator: Tuple (By, value) pour localiser l'élément
            expected_text: Texte attendu (peut être une partie du texte)
            timeout: Timeout en secondes (optionnel)
        
        Returns:
            bool: True si le texte correspond
        
        Raises:
            AssertionError: Si le texte ne correspond pas
        """
        element = self.find_element(locator, timeout)
        actual_text = element.text
        
        assert expected_text in actual_text or actual_text == expected_text, \
            f"Texte attendu '{expected_text}' non trouvé. Texte actuel: '{actual_text}'"
        return True
    
    def assert_location(self, expected_url_pattern, timeout=None):
        """
        Vérifier que l'URL actuelle contient le pattern attendu
        
        Args:
            expected_url_pattern: Pattern d'URL à vérifier (peut être une partie de l'URL)
            timeout: Timeout en secondes pour attendre l'URL (optionnel)
        
        Returns:
            bool: True si l'URL correspond
        
        Raises:
            AssertionError: Si l'URL ne correspond pas
        """
        if timeout:
            self.wait_for_url(expected_url_pattern, timeout)
        
        current_url = self.get_current_url()
        assert expected_url_pattern in current_url, \
            f"URL attendue contenant '{expected_url_pattern}' non trouvée. URL actuelle: '{current_url}'"
        return True

