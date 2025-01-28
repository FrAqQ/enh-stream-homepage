import tkinter as tk
from tkinter import ttk, messagebox
import threading
from proxy_handler import ProxyHandler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ViewerBot:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Viewer Bot")
        self.setup_gui()
        self.proxy_handler = ProxyHandler()
        self.active_viewers = []

    def setup_gui(self):
        # GUI-Setup Code hier...
        pass

    def spawn_viewers(self, url, count):
        """Spawnt die angegebene Anzahl von Viewern."""
        successful_spawns = 0
        
        for _ in range(count):
            proxy = self.proxy_handler.get_next_proxy()
            if not proxy:
                messagebox.showwarning("Warnung", "Keine weiteren Proxies verfügbar!")
                break

            logger.info(f"Teste Proxy: {proxy}")
            if self.proxy_handler.test_proxy(proxy):
                if self.proxy_handler.start_viewer_with_proxy(url, proxy):
                    successful_spawns += 1
                    self.active_viewers.append(proxy)
                    logger.info(f"Viewer erfolgreich gestartet mit Proxy: {proxy}")
                else:
                    logger.warning(f"Viewer konnte nicht gestartet werden mit Proxy: {proxy}")
            else:
                logger.warning(f"Proxy funktioniert nicht: {proxy}")

        if successful_spawns > 0:
            messagebox.showinfo("Erfolg", f"{successful_spawns} Viewer erfolgreich gestartet!")
        else:
            messagebox.showerror("Fehler", "Keine Viewer konnten gestartet werden!")

    def start_viewers(self):
        """Startet den Viewer-Spawn-Prozess in einem separaten Thread."""
        url = self.url_entry.get()
        try:
            count = int(self.count_entry.get())
            if not url or not url.startswith("https://www.twitch.tv/"):
                messagebox.showerror("Fehler", "Bitte geben Sie eine gültige Twitch-URL ein!")
                return
            
            thread = threading.Thread(target=self.spawn_viewers, args=(url, count))
            thread.daemon = True
            thread.start()
            
        except ValueError:
            messagebox.showerror("Fehler", "Bitte geben Sie eine gültige Anzahl ein!")

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    bot = ViewerBot()
    bot.run()