#!/usr/bin/env python3
"""
Add a new book to the Rainbow Pencil Press website.

What it does
  1. Cuts the FRONT cover out of your KDP full-wrap cover PDF  -> assets/covers/<id>.webp
  2. Saves a few interior pages for the "Look inside" gallery   -> assets/previews/<id>-1.webp ...
  3. Creates the QR review page <id>/index.html (only if it does not exist yet)
  4. Adds a ready-to-edit entry to data/books.js (with --write) or prints it

Install once:   pip install pymupdf pillow
Example:
  python tools/add_book.py --id tikko-italy --category tikko --number 2 \
      --title "Tikko and the ..." --subtitle "An Adventure in Italy" \
      --cover Tikko_Italy_cover.pdf --interior Tikko_Italy_interior.pdf \
      --pages 6,12,18,27 --ages "3-7" --emoji "🍕" --write

Run it from anywhere; paths inside the repo are found automatically.
"""
import argparse, datetime, json, os, re, sys

try:
    import pymupdf as fitz
except ImportError:  # older PyMuPDF
    import fitz
from PIL import Image

PT = 72.0           # points per inch
BLEED = 0.125 * PT  # KDP bleed (0.125")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MARKER = "/* NEW BOOKS: tools/add_book.py inserts new entries here */"


def render(page, clip, width):
    zoom = width / clip.width
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def trim_size(cover_pdf, interior_doc, trim):
    """(width, height) in points of ONE cover panel, without bleed."""
    page = fitz.open(cover_pdf)[0]
    th = page.rect.height - 2 * BLEED
    if trim:
        w, h = (float(v) for v in trim.lower().split("x"))
        return w * PT, h * PT
    if interior_doc is not None:
        r = interior_doc[0].rect
        # an interior with bleed is 0.25" taller and 0.125" wider than the trim size
        tw = r.width - BLEED if abs(r.height - (th + 2 * BLEED)) < 3 else r.width
        return tw, th
    return (8.5 * PT if abs(th - 11 * PT) < 3 else th), th  # 8.5x11 books, otherwise square


def front_cover(cover_pdf, tw, width=900):
    page = fitz.open(cover_pdf)[0]
    W, H = page.rect.width, page.rect.height
    clip = fitz.Rect(W - BLEED - tw, BLEED, W - BLEED, H - BLEED)
    return render(page, clip, width)


def interior_page(doc, number, th, width=900):
    """number is 1-based; bleed (if any) is trimmed off the top, bottom and outer edge."""
    page = doc[number - 1]
    r = page.rect
    if abs(r.height - (th + 2 * BLEED)) < 3:
        right_hand = number % 2 == 1          # odd pages are right-hand pages
        clip = fitz.Rect(r.x0 if right_hand else r.x0 + BLEED, r.y0 + BLEED,
                         r.x1 - BLEED if right_hand else r.x1, r.y1 - BLEED)
    else:
        clip = r
    return render(page, clip, width)


def save_webp(img, path, quality=80):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "WEBP", quality=quality, method=6)
    return os.path.relpath(path, ROOT).replace(os.sep, "/")


def make_review_page(book_id, title, emoji):
    target = os.path.join(ROOT, book_id, "index.html")
    if os.path.exists(target):
        print(f"  review page {book_id}/ already exists, left untouched")
        return
    html = open(os.path.join(ROOT, "tools", "review-page-template.html"), encoding="utf-8").read()
    html = (html.replace("{{TITLE}}", title)
                .replace("{{EMOJI}}", emoji)
                .replace("{{SEARCH}}", f"{title} Rainbow Pencil Press"))
    os.makedirs(os.path.dirname(target), exist_ok=True)
    open(target, "w", encoding="utf-8").write(html)
    print(f"  review page -> {book_id}/index.html   (QR: https://rainbowpencilpress.github.io/{book_id}/)")


def js_entry(a, cover, previews, page_count, size):
    entry = {
        "id": a.id,
        "title": a.title,
        "subtitle": a.subtitle,
        "category": a.category,
        "number": a.number,
        "asin": a.asin,
        "cover": cover,
        "previews": previews,
        "ages": a.ages,
        "pages": page_count,
        "size": size,
        "added": datetime.date.today().isoformat(),
        "description": "Paste the Amazon description here.",
        "highlights": ["First highlight", "Second highlight", "Third highlight"],
        "review": a.id + "/",
    }
    body = json.dumps(entry, ensure_ascii=False, indent=2)
    body = re.sub(r'^(\s*)"(\w+)":', r"\1\2:", body, flags=re.M)  # JS-style keys
    return body.replace("\n", "\n    ") + ","


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--id", required=True, help="short id, also the QR review folder, e.g. tikko-italy")
    p.add_argument("--title", required=True)
    p.add_argument("--subtitle", default="")
    p.add_argument("--category", required=True, help="tikko | feelings | coloring (or any id in data/books.js)")
    p.add_argument("--number", type=int, default=None, help="book number inside the series")
    p.add_argument("--cover", required=True, help="KDP full-wrap cover PDF")
    p.add_argument("--interior", help="KDP interior PDF (needed for the gallery)")
    p.add_argument("--pages", default="", help="interior page numbers for the gallery, e.g. 6,12,18,27")
    p.add_argument("--trim", default=None, help="trim size like 8.5x11 (auto-detected when omitted)")
    p.add_argument("--ages", default="3–7")
    p.add_argument("--asin", default="", help="leave empty until the book is live")
    p.add_argument("--emoji", default="📚", help="emoji shown on the QR review page")
    p.add_argument("--no-review-page", action="store_true")
    p.add_argument("--write", action="store_true", help="insert the entry into data/books.js")
    a = p.parse_args()

    if not re.fullmatch(r"[a-z0-9-]+", a.id):
        sys.exit("--id may only contain lowercase letters, digits and dashes")

    interior = fitz.open(a.interior) if a.interior else None
    tw, th = trim_size(a.cover, interior, a.trim)

    print(f"{a.title}  (trim {tw / PT:g} x {th / PT:g} in)")
    cover = save_webp(front_cover(a.cover, tw), os.path.join(ROOT, "assets", "covers", a.id + ".webp"), 84)
    print("  cover       ->", cover)

    previews = []
    if interior is not None and a.pages:
        nums = [int(x) for x in a.pages.split(",") if x.strip()]
        for i, n in enumerate(nums):
            path = os.path.join(ROOT, "assets", "previews", f"{a.id}-{i + 1}.webp")
            previews.append(save_webp(interior_page(interior, n, th), path))
            print("  preview     ->", previews[-1], f"(page {n})")

    if not a.no_review_page:
        make_review_page(a.id, a.title + (": " + a.subtitle if a.subtitle else ""), a.emoji)

    q = lambda v: f"{round(v / PT * 4) / 4:g}"  # 8.49 in -> 8.5
    size = f"{q(tw)} × {q(th)} in paperback"
    entry = js_entry(a, cover, previews, len(interior) if interior is not None else None, size)
    data = os.path.join(ROOT, "data", "books.js")
    if a.write:
        src = open(data, encoding="utf-8").read()
        if MARKER not in src:
            sys.exit("Marker comment not found in data/books.js. Paste this entry by hand:\n\n    " + entry)
        if re.search(r'\bid:\s*"' + re.escape(a.id) + '"', src):
            sys.exit(f'A book with id "{a.id}" is already in data/books.js')
        src = src.replace(MARKER, entry + "\n    " + MARKER)
        open(data, "w", encoding="utf-8").write(src)
        print("  added to data/books.js -> now fill in description, highlights (and asin when live)")
    else:
        print("\nPaste this into the books list in data/books.js:\n\n    " + entry)


if __name__ == "__main__":
    main()
