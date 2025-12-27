"""
Configuration pour les tests Selenium
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration de base pour les tests"""
    
    # URLs
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:4200')
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8081')
    
    # Navigateur
    BROWSER = os.getenv('BROWSER', 'chrome')  # chrome, firefox, edge
    HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'
    
    # Timeouts
    IMPLICIT_WAIT = int(os.getenv('IMPLICIT_WAIT', '10'))
    EXPLICIT_WAIT = int(os.getenv('EXPLICIT_WAIT', '20'))
    PAGE_LOAD_TIMEOUT = int(os.getenv('PAGE_LOAD_TIMEOUT', '30'))
    
    # Credentials de test
    TEST_USER_EMAIL = os.getenv('TEST_USER_EMAIL', 'idrissi@etud.com')
    TEST_USER_PASSWORD = os.getenv('TEST_USER_PASSWORD', 'test123')
    
    # Screenshots
    SCREENSHOT_DIR = os.getenv('SCREENSHOT_DIR', 'screenshots')
    SCREENSHOT_ON_FAILURE = os.getenv('SCREENSHOT_ON_FAILURE', 'true').lower() == 'true'
    
    # Reports
    REPORT_DIR = os.getenv('REPORT_DIR', 'reports')

