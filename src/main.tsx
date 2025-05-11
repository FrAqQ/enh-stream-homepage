
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Verbesserte Fehlerbehandlung beim Rendering
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element nicht gefunden! Überprüfen Sie, ob das 'root'-Element in Ihrem HTML existiert.");
  }
  
  // App in einem Error Boundary einpacken
  createRoot(rootElement).render(
    <App />
  );
  
  console.log("App erfolgreich gerendert");
} catch (error) {
  console.error("Kritischer Fehler beim Rendern der App:", error);
  
  // Einen Fallback rendern
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Etwas ist schiefgelaufen</h1>
        <p>Die Anwendung konnte nicht geladen werden. Bitte laden Sie die Seite neu oder kontaktieren Sie den Support.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 20px;">
          Seite neu laden
        </button>
      </div>
    `;
  }
}
