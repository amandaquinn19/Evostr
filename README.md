# Evostr — Website

Marketing and consulting website for Evostr, built as a static HTML/CSS site.

---

## Stack

- **Frontend:** HTML / CSS (static, no build step)
- **Hosting:** Netlify (auto-deploys on push to `main`)

---

## Local Development

No build tools required for the main site. Open any `.html` file directly in a browser, or use a local server for accurate link resolution:

```bash
# Option 1 — VS Code Live Server extension (recommended)
# Right-click any .html file → "Open with Live Server"

# Option 2 — Python (if installed)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

---

## Deployment

Deploys are handled automatically by Netlify. Any push to the `main` branch triggers a new production deploy. Pull requests generate deploy previews automatically.

---


## Project Structure

```
/
├── index.html              # Homepage
├── how-we-work.html        # Process / engagement model
├── evolution-ladder.html   # BPO Evolution Ladder framework
├── assessment.html         # Diagnostic assessment page
├── styles.css              # Global stylesheet (design tokens + components)
├── assets/
│   ├── images/             # Site images
│   └── brand samples/      # Brand reference PDFs (not deployed)
├── _memory/                # Internal reference docs (not deployed)
└── resources.html/          
```

---

## Notes

- All color tokens, typography, and spacing are defined as CSS custom properties at the top of `styles.css`
- `.cream` sections render as `--matte-steel` globally — this is intentional per the brand system
- Oak Bright (`#D4AB52`) is for use on navy/dark backgrounds only; Oak Brown (`#886D34`) on light backgrounds only
