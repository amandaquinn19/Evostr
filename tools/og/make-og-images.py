#!/usr/bin/env python3
"""
Generate Open Graph share cards (1200x630) for every page on evostr.com.

Reads each page's <h1> straight from the HTML, so new articles pick up a card
automatically -- just re-run this script after publishing one.

    python3 tools/og/make-og-images.py            # only build missing cards
    python3 tools/og/make-og-images.py --all      # rebuild every card

Output: assets/og/<slug>.jpg
Brand spec: Evostr Visual Identity Guidelines v1.0 (dark surface pairing).
"""
import re, os, sys, glob, html
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))   # tools/og -> site root
FONTS = os.path.join(HERE, "fonts")
OUT   = os.path.join(ROOT, "assets", "og")

W, H      = 1200, 630
MARGIN    = 80
LIELA     = (32, 41, 79)        # #20294F  primary surface
OAK_LIGHT = (212, 171, 82)      # #D4AB52  accent on Liela
WHITE     = (255, 255, 255)
BODY_DARK = (168, 168, 168)     # #A8A8A8  body on Liela
HAIRLINE  = (255, 255, 255, 26) # rgba(255,255,255,.1)

SERIF_XB = os.path.join(FONTS, "NotoSerif-ExtraBold.ttf")
SERIF_B  = os.path.join(FONTS, "NotoSerif-Bold.ttf")
SANS_SB  = os.path.join(FONTS, "Inter-SemiBold.ttf")
SANS_M   = os.path.join(FONTS, "Inter-Medium.ttf")

# Overline + accent phrase per top-level page. Accent = the word or short phrase
# the reader should linger on; never more than ~30% of the headline.
PAGES = {
    "index.html":                ("STRATEGIC GROWTH CONSULTING FOR BPOs",   "bifurcating."),
    "evolution-ladder.html":     ("THE FRAMEWORK · SEVEN RUNGS, TWO RIFTS", None),
    "how-we-work.html":          ("HOW WE WORK",                            "strategy."),
    "about.html":                ("ABOUT EVOSTR",                           "shaping it."),
    "resources.html":            ("RESOURCES",                              "here"),
    "articles.html":             ("ARTICLES",                               "what's shifting"),
    "assessment.html":           ("STRATEGIC GROWTH ASSESSMENT",            "hasn't caught up."),
    "commercial-gap-check.html": ("FREE DIAGNOSTIC · 10 QUESTIONS",         "why it isn't converting."),
    "qualification.html":        ("IS THIS FOR YOU?",                       "already decided to move."),
    "book.html":                 ("BOOK A CONVERSATION",                    "worth."),
    "brand-advisory-group.html": ("BRAND ADVISORY GROUP",                   "stop the guessing."),
}
ARTICLE_OVERLINE = "ARTICLE"


def clean(raw):
    """Strip tags, decode entities, collapse whitespace."""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", raw))).strip()


def get_h1(path):
    with open(path, encoding="utf-8", errors="replace") as fh:
        m = re.search(r"<h1[^>]*>(.*?)</h1>", fh.read(), re.S)
    return clean(m.group(1)) if m else None


def tracked_width(draw, text, font, tracking):
    return sum(draw.textlength(c, font=font) for c in text) + tracking * max(len(text) - 1, 0)


def draw_tracked(draw, xy, text, font, fill, tracking):
    x, y = xy
    for c in text:
        draw.text((x, y), c, font=font, fill=fill)
        x += draw.textlength(c, font=font) + tracking
    return x


def wrap(draw, words, font, tracking, max_w):
    """Greedy wrap on a list of (word, colour) tuples."""
    lines, cur = [], []
    for w in words:
        trial = cur + [w]
        text = " ".join(t for t, _ in trial)
        if tracked_width(draw, text, font, tracking) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = [w]
    if cur:
        lines.append(cur)
    return lines


def split_accent(headline, accent):
    """Tag each word white, except the words belonging to the accent phrase."""
    words = headline.split()
    if not accent:
        return [(w, WHITE) for w in words]
    acc = accent.split()
    n = len(acc)
    norm = lambda s: s.lower().strip('."“”’,')
    for i in range(len(words) - n + 1):
        if [norm(x) for x in words[i:i + n]] == [norm(x) for x in acc]:
            return [(w, OAK_LIGHT if i <= j < i + n else WHITE) for j, w in enumerate(words)]
    print(f"    ! accent phrase {accent!r} not found in headline; skipping accent")
    return [(w, WHITE) for w in words]


def build_card(headline, overline, accent, dest):
    img  = Image.new("RGB", (W, H), LIELA)
    draw = ImageDraw.Draw(img, "RGBA")

    # Section rule -- three 24x3 gold bars, 10px gap, 2px radius
    y = MARGIN
    for i in range(3):
        x = MARGIN + i * 34
        draw.rounded_rectangle([x, y, x + 24, y + 3], radius=2, fill=OAK_LIGHT)

    # Overline -- Inter SemiBold, uppercase, +2.4px tracking, accent gold
    y += 30
    f_over = ImageFont.truetype(SANS_SB, 19)
    draw_tracked(draw, (MARGIN, y), overline, f_over, OAK_LIGHT, 2.4)

    # Footer -- hairline, reversed logo, domain
    logo = Image.open(os.path.join(HERE, "logo-reversed.png")).convert("RGBA")
    logo_w = 300
    logo = logo.resize((logo_w, round(logo.height * logo_w / logo.width)), Image.LANCZOS)
    footer_top = H - MARGIN - logo.height - 34
    draw.line([(MARGIN, footer_top), (W - MARGIN, footer_top)], fill=HAIRLINE, width=1)
    img.paste(logo, (MARGIN, H - MARGIN - logo.height), logo)

    f_dom = ImageFont.truetype(SANS_M, 19)
    dom_w = tracked_width(draw, "evostr.com", f_dom, 0.4)
    draw_tracked(draw, (W - MARGIN - dom_w, H - MARGIN - logo.height // 2 - 12),
                 "evostr.com", f_dom, BODY_DARK, 0.4)

    # Headline -- Noto Serif, auto-fit, tracking -0.04em, line-height 1.08
    words   = split_accent(headline, accent)
    max_w   = W - 2 * MARGIN
    top     = y + 46
    avail_h = footer_top - 52 - top

    for size in range(76, 33, -2):
        path  = SERIF_XB if len(headline) <= 62 else SERIF_B
        font  = ImageFont.truetype(path, size)
        track = -0.04 * size
        lines = wrap(draw, words, font, track, max_w)
        lh    = round(size * 1.08)
        if len(lines) <= 4 and len(lines) * lh <= avail_h:
            break

    ty = top + (avail_h - len(lines) * lh) // 2
    for line in lines:
        tx = MARGIN
        for i, (word, colour) in enumerate(line):
            tx = draw_tracked(draw, (tx, ty), word, font, colour, track)
            if i < len(line) - 1:
                tx += draw.textlength(" ", font=font) + track
        ty += lh

    os.makedirs(os.path.dirname(dest), exist_ok=True)
    img.save(dest, "JPEG", quality=88, optimize=True, progressive=True)
    return os.path.getsize(dest)


def main():
    rebuild = "--all" in sys.argv
    os.chdir(ROOT)
    targets = [(f, PAGES.get(f, (os.path.splitext(f)[0].replace('-', ' ').upper(), None)))
               for f in sorted(glob.glob("*.html"))]
    targets += [(f, (ARTICLE_OVERLINE, None))
                for f in sorted(glob.glob("articles/*.html")) if "_template" not in f]

    made = skipped = 0
    for path, (overline, accent) in targets:
        slug = "home" if path == "index.html" else os.path.splitext(os.path.basename(path))[0]
        dest = os.path.join(OUT, slug + ".jpg")
        if os.path.exists(dest) and not rebuild:
            skipped += 1
            continue
        h1 = get_h1(path)
        if not h1:
            print(f"  -- {path}: no <h1>, skipped")
            continue
        size = build_card(h1, overline, accent, dest)
        print(f"  ok {slug + '.jpg':52s} {size // 1024:4d} KB   {h1[:52]}")
        made += 1
    print(f"\n{made} card(s) written to assets/og/, {skipped} already present"
          f"{' (use --all to rebuild)' if skipped else ''}")


if __name__ == "__main__":
    main()
