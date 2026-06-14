# Evostr — Website

Marketing and consulting website for Evostr, built as a static HTML/CSS site.

---

## Stack

- **Frontend:** HTML / CSS (static, no build step)
- **Hosting:** Netlify (auto-deploys on push to `main`)
- **CMS:** Sanity.io (for resources and dynamic content)

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

### Sanity Studio

If working with CMS content, navigate to the Sanity studio folder and run:

```bash
cd studio
npm install
npm run dev
```

The studio will be available at `http://localhost:3333`.

---

## Deployment

Deploys are handled automatically by Netlify. Any push to the `main` branch triggers a new production deploy. Pull requests generate deploy previews automatically.

---

## Environment Variables

The following variables are required for Sanity integration. Set them in Netlify's environment variable settings — never commit actual values to the repo.

| Variable | Description |
|----------|-------------|
| `SANITY_PROJECT_ID` | Found in your Sanity project dashboard |
| `SANITY_DATASET` | Typically `production` |
| `SANITY_API_TOKEN` | Read token from Sanity API settings |

For local development, create a `.env.local` file in the root (already gitignored) and add the same variables.

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
└── studio/                 # Sanity studio (if applicable)
```

---

## Notes

- All color tokens, typography, and spacing are defined as CSS custom properties at the top of `styles.css`
- `.cream` sections render as `--matte-steel` globally — this is intentional per the brand system
- Oak Bright (`#D4AB52`) is for use on navy/dark backgrounds only; Oak Brown (`#886D34`) on light backgrounds only
