New Attend App - Final fixed bundle

Included files:
- index.html (UI Arabic, QR scanner, manual entry, reports)
- app.js (uses corsproxy.io + your Google Apps Script exec URL)
- styles.css
- manifest.json, service-worker.js
- google_apps_script.gs (final corrected script for your Sheet)
- README.md

Important steps to finish setup:
1. Open your Google Sheet. Create two sheets: 'QRData' and 'Database' (headers optional).
2. In the Sheet choose Extensions -> Apps Script. Create a new project and replace Code.gs with the contents of google_apps_script.gs provided in this bundle.
3. Save, then Deploy -> New deployment -> Web app.
   - Execute as: Me
   - Who has access: Anyone
4. If you prefer NOT to use corsproxy.io, after Deploy copy the Exec URL and edit app.js to set GOOGLE_SCRIPT_URL to: https://script.google.com/macros/s/XXXXX/exec (remove corsproxy prefix). Using corsproxy is simpler to avoid CORS.
5. Upload the project to GitHub (or use local static server) and access the page.

Your Apps Script exec used in bundle (wrapped by corsproxy):
https://script.google.com/macros/s/AKfycbz0vNZg6eCWm-bJ-LOKqY_YqvEUDTyasqy5UF6QvWgUf7xFpxqfJ7pu2QhuKtgjSW7u/exec
