
from twitch.gui import GUI
from twitch.proxy_manager import get_next_proxy
from twitch.manager import InstanceManager

# Manager initialisieren (Hier statt in main.py!)
SPAWNER_THREAD_COUNT = 3
CLOSER_THREAD_COUNT = 10
PROXY_FILE_NAME = "proxy_list.txt"
HEADLESS = True
AUTO_RESTART = False
SPAWN_INTERVAL_SECONDS = 2
TARGET_URL = None

manager = InstanceManager(
    spawn_thread_count=SPAWNER_THREAD_COUNT,
    delete_thread_count=CLOSER_THREAD_COUNT,
    headless=HEADLESS,
    auto_restart=AUTO_RESTART,
    proxy_file_name=PROXY_FILE_NAME,
    spawn_interval_seconds=SPAWN_INTERVAL_SECONDS,
    target_url=TARGET_URL,
)

class APIGUI(GUI):
    def __init__(self, manager):
        super().__init__(manager)

    def set_twitch_url(self, url):
        """Setzt die Twitch-URL in das Textfeld der GUI."""
        try:
            channel_entry = self.tab_main.nametowidget("channel_url_entry")
            channel_entry.delete(0, "end")
            channel_entry.insert(0, url)
            print(f"Twitch-URL in GUI gesetzt: {url}")
        except Exception as e:
            print(f"Fehler beim Setzen der Twitch-URL: {e}")

    def spawn_viewers(self, count, twitch_url):
        """Spawnt die angegebene Anzahl von Viewern."""
        print(f"Spawne {count} Viewer für {twitch_url}...")
        for _ in range(count):
            proxy = get_next_proxy(twitch_url)
            if not proxy:
                print("Keine Proxies mehr verfügbar.")
                return f"Alle Proxies wurden für {twitch_url} verwendet."
            self.set_twitch_url(twitch_url)
            print(f"Verwende Proxy: {proxy}")
            self.tab_main.spawn_one_func()

    def remove_viewers(self, count, twitch_url):
        """Entfernt die angegebene Anzahl von Viewern."""
        try:
            print(f"Entferne {count} Viewer von {twitch_url}...")
            # Setze zuerst die URL
            self.set_twitch_url(twitch_url)
            
            # Rufe die close_func direkt vom Manager auf
            for _ in range(count):
                self.manager.close_browser()
            
            return f"Erfolgreich {count} Viewer von {twitch_url} entfernt"
        except Exception as e:
            print(f"Fehler beim Entfernen der Viewer: {e}")
            raise Exception(f"Fehler beim Entfernen der Viewer: {e}")

# Initialisiere die API-GUI direkt hier
api_gui = APIGUI(manager)

