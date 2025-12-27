"""
Configuration pytest pour les tests Selenium
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from config import Config
import os
from datetime import datetime


@pytest.fixture(scope="session")
def driver():
    """Fixture pour créer et gérer le driver Selenium"""
    driver = None
    
    # Configuration selon le navigateur
    if Config.BROWSER.lower() == 'chrome':
        options = ChromeOptions()
        if Config.HEADLESS:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except Exception as e:
            # Fallback: utiliser le driver système si webdriver-manager échoue
            print(f"Warning: webdriver-manager failed, trying system Chrome driver: {e}")
            driver = webdriver.Chrome(options=options)
        
    elif Config.BROWSER.lower() == 'firefox':
        options = FirefoxOptions()
        if Config.HEADLESS:
            options.add_argument('--headless')
        service = Service(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=options)
        
    elif Config.BROWSER.lower() == 'edge':
        options = EdgeOptions()
        if Config.HEADLESS:
            options.add_argument('--headless')
        service = Service(EdgeChromiumDriverManager().install())
        driver = webdriver.Edge(service=service, options=options)
    
    else:
        raise ValueError(f"Navigateur non supporté: {Config.BROWSER}")
    
    # Configuration des timeouts
    driver.implicitly_wait(Config.IMPLICIT_WAIT)
    driver.set_page_load_timeout(Config.PAGE_LOAD_TIMEOUT)
    driver.maximize_window()
    
    yield driver
    
    # Cleanup
    if driver:
        driver.quit()


@pytest.fixture(scope="function")
def setup_driver(driver):
    """Setup avant chaque test"""
    driver.get(Config.BASE_URL)
    yield driver


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook pour capturer les screenshots en cas d'échec"""
    outcome = yield
    rep = outcome.get_result()
    
    if rep.when == "call" and rep.failed and Config.SCREENSHOT_ON_FAILURE:
        driver = item.funcargs.get('driver') or item.funcargs.get('setup_driver')
        if driver:
            # Créer le dossier screenshots s'il n'existe pas
            os.makedirs(Config.SCREENSHOT_DIR, exist_ok=True)
            
            # Nom du fichier avec timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = os.path.join(
                Config.SCREENSHOT_DIR,
                f"{item.name}_{timestamp}.png"
            )
            
            try:
                driver.save_screenshot(screenshot_path)
                print(f"\nScreenshot sauvegardé: {screenshot_path}")
            except Exception as e:
                print(f"Erreur lors de la sauvegarde du screenshot: {e}")

