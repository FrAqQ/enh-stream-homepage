import os
import requests
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProxyHandler:
    def __init__(self):
        self.proxy_file = os.path.join('proxy', 'proxy_list.txt')
        self.used_proxies = set()

    def get_next_proxy(self):
        """Holt den nächsten verfügbaren Proxy aus der Liste."""
        if not os.path.exists(self.proxy_file):
            logger.error(f"Proxy-Datei nicht gefunden: {self.proxy_file}")
            return None

        with open(self.proxy_file, 'r') as file:
            proxies = file.readlines()

        for proxy in proxies:
            proxy = proxy.strip()
            if proxy and proxy not in self.used_proxies:
                self.used_proxies.add(proxy)
                return proxy
        return None

    def create_chrome_options(self, proxy_string):
        """Erstellt Chrome-Optionen mit Proxy-Konfiguration."""
        try:
            ip, port, username, password = proxy_string.split(':')
            
            chrome_options = uc.ChromeOptions()
            chrome_options.add_argument(f'--proxy-server={ip}:{port}')
            
            # Proxy-Authentifizierung
            manifest_json = """
            {
                "version": "1.0.0",
                "manifest_version": 2,
                "name": "Chrome Proxy",
                "permissions": [
                    "proxy",
                    "tabs",
                    "unlimitedStorage",
                    "storage",
                    "webRequest",
                    "webRequestBlocking"
                ],
                "background": {
                    "scripts": ["background.js"]
                }
            }
            """

            background_js = f"""
            var config = {{
                mode: "fixed_servers",
                rules: {{
                    singleProxy: {{
                        scheme: "http",
                        host: "{ip}",
                        port: parseInt({port})
                    }},
                    bypassList: ["localhost"]
                }}
            }};

            chrome.proxy.settings.set({{value: config, scope: "regular"}}, function() {{}});

            function callbackFn(details) {{
                return {{
                    authCredentials: {{
                        username: "{username}",
                        password: "{password}"
                    }}
                }};
            }}

            chrome.webRequest.onAuthRequired.addListener(
                callbackFn,
                {{urls: ["<all_urls>"]}},
                ['blocking']
            );
            """

            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--disable-extensions')
            chrome_options.add_argument('--headless')
            
            return chrome_options
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Chrome-Optionen: {str(e)}")
            return None

    def start_viewer_with_proxy(self, url, proxy_string):
        """Startet einen Viewer mit dem angegebenen Proxy."""
        try:
            chrome_options = self.create_chrome_options(proxy_string)
            if not chrome_options:
                return False

            driver = uc.Chrome(options=chrome_options)
            driver.get(url)

            # Warte auf das Twitch-Player-Element
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CLASS_NAME, "video-player"))
            )

            # Setze Qualität auf 160p
            quality_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@data-a-target='player-settings-button']"))
            )
            quality_button.click()

            quality_menu = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@data-a-target='player-settings-menu-item-quality']"))
            )
            quality_menu.click()

            lowest_quality = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//div[@data-a-target='player-settings-menu']//div[contains(text(), '160p')]"))
            )
            lowest_quality.click()

            logger.info(f"Viewer erfolgreich gestartet mit Proxy: {proxy_string}")
            return True

        except Exception as e:
            logger.error(f"Fehler beim Starten des Viewers: {str(e)}")
            if 'driver' in locals():
                driver.quit()
            return False

    def test_proxy(self, proxy_string):
        """Testet, ob ein Proxy funktioniert."""
        try:
            ip, port, username, password = proxy_string.split(':')
            proxies = {
                'http': f'http://{username}:{password}@{ip}:{port}',
                'https': f'http://{username}:{password}@{ip}:{port}'
            }
            
            response = requests.get('http://ip-api.com/json', proxies=proxies, timeout=10)
            return response.status_code == 200
        except:
            return False