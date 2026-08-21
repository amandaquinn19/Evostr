# Open Graph card generator

Builds the 1200x630 share cards referenced by every page's `og:image` tag.

    python3 tools/og/make-og-images.py          # build only missing cards
    python3 tools/og/make-og-images.py --all    # rebuild everything

Cards are written to `assets/og/<slug>.jpg`. The slug is the page filename
without its extension (`index.html` becomes `home.jpg`).

Headlines come straight from each page's `<h1>`, so **after publishing a new
article, run this script** and the card appears. Nothing else to update.

`PAGES` at the top of the script holds the overline and the accent phrase for
each top-level page. Articles use the overline `ARTICLE` and no accent. To
colour a phrase gold on a new page, add an entry there — the accent must match
words that actually appear in the `<h1>`, or the script warns and skips it.

Design follows the dark-surface pairing in the Evostr Visual Identity
Guidelines: Liela `#20294F` ground, Bright Oak Brown `#D4AB52` accent, white
headline in Noto Serif, overline in Inter, reversed logo at 300px.

`fonts/` holds Noto Serif and Inter as TTF because Pillow cannot read the WOFF2
files the site loads from Google Fonts. They are the same typefaces.
