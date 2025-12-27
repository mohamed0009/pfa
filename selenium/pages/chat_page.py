"""
Page Object pour le chat IA
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage
import time


class ChatPage(BasePage):
    """Page du chat avec l'IA"""
    
    # Locators - Sidebar Conversations
    CONVERSATIONS_SIDEBAR = (By.CSS_SELECTOR, ".conversations-sidebar, aside")
    NEW_CONVERSATION_BUTTON = (By.XPATH, "//button[contains(@class, 'btn-icon')]//span[contains(text(), 'add_circle') or contains(@class, 'add')]/parent::button | //button[contains(text(), 'Nouvelle Conversation')] | //button[contains(text(), 'Commencer une conversation')]")
    CONVERSATION_ITEMS = (By.CSS_SELECTOR, ".conversation-item, [class*='conversation']")
    EMPTY_CONVERSATIONS_MESSAGE = (By.XPATH, "//div[contains(@class, 'empty-conversations')] | //p[contains(text(), 'Aucune conversation')]")
    
    # Locators - Chat Area
    CHAT_AREA = (By.CSS_SELECTOR, ".chat-area, main.chat-area")
    CHAT_HEADER = (By.CSS_SELECTOR, ".chat-header, header.chat-header")
    CHAT_TITLE = (By.XPATH, "//h3[contains(text(), 'Coach Virtuel') or contains(text(), 'IA')]")
    EMPTY_CHAT_MESSAGE = (By.XPATH, "//div[contains(@class, 'empty-chat')] | //h3[contains(text(), 'Coach Virtuel IA')]")
    
    # Locators - Messages
    MESSAGES_CONTAINER = (By.CSS_SELECTOR, ".messages-container, .messages-list")
    MESSAGE_BUBBLES = (By.CSS_SELECTOR, ".message, .message-bubble")
    USER_MESSAGES = (By.CSS_SELECTOR, ".message-user .message-bubble, .message.message-user")
    AI_MESSAGES = (By.CSS_SELECTOR, ".message-ai .message-bubble, .message.message-ai")
    TYPING_INDICATOR = (By.CSS_SELECTOR, ".typing-indicator, .message-ai .typing-indicator")
    
    # Locators - Message Input
    MESSAGE_INPUT = (By.CSS_SELECTOR, "input.message-input, input[name='message'], input[placeholder*='question' i], input[type='text']")
    SEND_BUTTON = (By.CSS_SELECTOR, "button.btn-send, button[type='submit'], button:has(span.material-icons)")
    VOICE_INPUT_BUTTON = (By.CSS_SELECTOR, ".btn-voice-input, button[title*='vocale' i]")
    ATTACH_BUTTON = (By.CSS_SELECTOR, ".btn-icon[title*='Pièce jointe' i], button[title*='attach' i]")
    
    # Locators - New Conversation Modal
    NEW_CONVERSATION_MODAL = (By.CSS_SELECTOR, ".modal, [class*='modal']")
    NEW_CONVERSATION_TITLE_INPUT = (By.CSS_SELECTOR, "input[placeholder*='titre' i], input[type='text']")
    CREATE_CONVERSATION_BUTTON = (By.XPATH, "//button[contains(text(), 'Créer') or contains(text(), 'Create')]")
    CANCEL_BUTTON = (By.XPATH, "//button[contains(text(), 'Annuler') or contains(text(), 'Cancel')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        # Attendre que la page soit chargée
        try:
            self.wait_for_url("/user/chat", timeout=30)
        except:
            time.sleep(2)
    
    def is_chat_loaded(self):
        """Vérifier si le chat est chargé"""
        # Vérifier l'URL
        if "/user/chat" not in self.driver.current_url:
            return False
        
        # Vérifier la présence d'éléments du chat
        return (self.is_element_present(self.CHAT_AREA, timeout=5) or
                self.is_element_present(self.CONVERSATIONS_SIDEBAR, timeout=5))
    
    def click_new_conversation(self):
        """Cliquer sur le bouton pour créer une nouvelle conversation"""
        # Essayer plusieurs sélecteurs
        try:
            self.click_element(self.NEW_CONVERSATION_BUTTON)
        except:
            # Essayer de trouver le bouton dans la sidebar
            sidebar = self.find_element(self.CONVERSATIONS_SIDEBAR)
            buttons = sidebar.find_elements(By.TAG_NAME, "button")
            for button in buttons:
                if "add" in button.get_attribute("class") or "new" in button.get_attribute("class").lower():
                    button.click()
                    break
    
    def create_new_conversation(self, title="Test Conversation"):
        """Créer une nouvelle conversation"""
        self.click_new_conversation()
        time.sleep(1)
        
        # Remplir le titre si le modal est ouvert
        try:
            title_input = self.find_element(self.NEW_CONVERSATION_TITLE_INPUT, timeout=3)
            title_input.clear()
            title_input.send_keys(title)
            time.sleep(0.5)
            
            # Cliquer sur créer
            self.click_element(self.CREATE_CONVERSATION_BUTTON)
            time.sleep(2)
        except:
            # Si pas de modal, la conversation est peut-être créée automatiquement
            pass
    
    def select_conversation(self, index=0):
        """Sélectionner une conversation par index"""
        conversations = self.find_elements(self.CONVERSATION_ITEMS)
        if conversations and index < len(conversations):
            conversations[index].click()
            time.sleep(1)
    
    def send_message(self, message_text):
        """Envoyer un message dans le chat"""
        # Trouver le champ de saisie avec plusieurs stratégies
        message_input = None
        try:
            message_input = self.find_element(self.MESSAGE_INPUT, timeout=10)
        except:
            try:
                # Essayer avec name
                message_input = self.driver.find_element(By.NAME, "message")
            except:
                try:
                    # Essayer avec placeholder
                    message_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='question' i]")
                except:
                    # Dernière tentative: n'importe quel input dans le formulaire
                    message_input = self.driver.find_element(By.CSS_SELECTOR, ".message-form input[type='text']")
        
        message_input.clear()
        message_input.send_keys(message_text)
        time.sleep(0.5)
        
        # Cliquer sur envoyer
        try:
            # Chercher le bouton send dans le formulaire
            send_button = self.driver.find_element(By.CSS_SELECTOR, "button.btn-send, button[type='submit']")
            if send_button.is_enabled():
                send_button.click()
            else:
                # Si le bouton est désactivé, essayer Enter
                from selenium.webdriver.common.keys import Keys
                message_input.send_keys(Keys.RETURN)
        except:
            # Essayer d'envoyer avec Enter
            from selenium.webdriver.common.keys import Keys
            message_input.send_keys(Keys.RETURN)
        
        time.sleep(2)  # Attendre l'envoi
    
    def get_last_message(self):
        """Obtenir le dernier message affiché"""
        messages = self.find_elements(self.MESSAGE_BUBBLES)
        if messages:
            return messages[-1].text
        return None
    
    def get_last_ai_message(self):
        """Obtenir le dernier message de l'IA"""
        ai_messages = self.find_elements(self.AI_MESSAGES)
        if ai_messages:
            return ai_messages[-1].text
        return None
    
    def get_last_user_message(self):
        """Obtenir le dernier message de l'utilisateur"""
        user_messages = self.find_elements(self.USER_MESSAGES)
        if user_messages:
            return user_messages[-1].text
        return None
    
    def wait_for_ai_response(self, timeout=30):
        """Attendre une réponse de l'IA"""
        import time
        start_time = time.time()
        
        # Attendre que l'indicateur de frappe disparaisse
        while time.time() - start_time < timeout:
            try:
                # Vérifier si l'indicateur de frappe est présent
                typing = self.is_element_present(self.TYPING_INDICATOR, timeout=1)
                if not typing:
                    # Vérifier si un nouveau message AI est apparu
                    ai_messages = self.find_elements(self.AI_MESSAGES)
                    if ai_messages:
                        return True
                time.sleep(1)
            except:
                time.sleep(1)
        
        return False
    
    def is_typing_indicator_visible(self):
        """Vérifier si l'indicateur de frappe est visible"""
        return self.is_element_visible(self.TYPING_INDICATOR, timeout=2)
    
    def get_conversations_count(self):
        """Obtenir le nombre de conversations"""
        conversations = self.find_elements(self.CONVERSATION_ITEMS)
        return len(conversations)
    
    def has_conversations(self):
        """Vérifier s'il y a des conversations"""
        return self.get_conversations_count() > 0
    
    def delete_conversation(self, index=0):
        """Supprimer une conversation par index"""
        conversations = self.find_elements(self.CONVERSATION_ITEMS)
        if conversations and index < len(conversations):
            # Trouver le bouton de suppression dans la conversation
            delete_buttons = conversations[index].find_elements(By.CSS_SELECTOR, ".btn-delete, button[title='Supprimer']")
            if delete_buttons:
                delete_buttons[0].click()
                time.sleep(1)

