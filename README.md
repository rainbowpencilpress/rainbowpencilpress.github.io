# Rainbow Pencil Press – website

Το site ζει στο https://rainbowpencilpress.github.io/ (GitHub Pages, χωρίς build, απλά στατικά αρχεία).

## Τι υπάρχει πού

| Αρχείο / φάκελος | Τι είναι |
|---|---|
| `data/books.js` | **Όλο το περιεχόμενο**: κατηγορίες, βιβλία, χαρακτήρες. Σχεδόν πάντα αλλάζεις μόνο αυτό. |
| `index.html` | Η σελίδα (κείμενα hero, Feelings corner, free pages). |
| `assets/css/style.css`, `assets/js/app.js` | Εμφάνιση και λογική. Δεν χρειάζεται να τα αγγίξεις. |
| `assets/covers/` | Εξώφυλλα (front cover, WebP). |
| `assets/previews/` | Σελίδες για το «Look inside». |
| `assets/characters/` | Χαρακτήρες με διάφανο φόντο. |
| `printables/` | Δωρεάν σελίδες ζωγραφικής (PDF). |
| `dino/`, `pimmo1/`, `tikko-greece/`, `animal-abc/` | Οι σελίδες review των QR codes. **Μην τις μετονομάσεις**: τα τυπωμένα βιβλία δείχνουν εκεί. |
| `tools/add_book.py` | Script που προσθέτει νέο βιβλίο. |
| `404.html` | Σελίδα για λάθος links. |

## Ανέβασμα στο GitHub (μία φορά)

**Από το browser (πιο απλό):**
1. Αποσυμπίεσε το zip.
2. Πήγαινε στο repo `rainbowpencilpress.github.io` → **Add file → Upload files**.
3. Σύρε **τα περιεχόμενα** του φακέλου (όχι τον ίδιο τον φάκελο) μέσα στη σελίδα.
   Το `index.html` αντικαθιστά το «Under Construction». Οι φάκελοι `dino/`, `pimmo1/`, `tikko-greece/` είναι ίδιοι με αυτούς που έχεις ήδη.
4. **Commit changes**. Σε 1–2 λεπτά το site είναι live.

(Το κρυφό αρχείο `.nojekyll` μπορεί να μην ανέβει από Finder/Explorer. Δεν πειράζει, είναι προαιρετικό.)

**Ή με git:**
```bash
git clone https://github.com/rainbowpencilpress/rainbowpencilpress.github.io.git
cp -r rainbowpencilpress-site/. rainbowpencilpress.github.io/
cd rainbowpencilpress.github.io
git add -A && git commit -m "New website" && git push
```

Για να το δεις τοπικά πριν το ανεβάσεις: `python3 -m http.server` μέσα στον φάκελο και άνοιξε http://localhost:8000

## Νέο βιβλίο

### Με το script (προτείνεται)

Μία φορά: `pip install pymupdf pillow`

```bash
python tools/add_book.py \
  --id tikko-italy --category tikko --number 2 \
  --title "Tikko and the ..." --subtitle "An Adventure in Italy" \
  --cover ~/kdp/Tikko_Italy_cover.pdf --interior ~/kdp/Tikko_Italy_interior.pdf \
  --pages 6,12,18,27 --ages "3–7" --emoji "🍕" --write
```

Τι κάνει μόνο του:
- κόβει το front cover από το full-wrap PDF του KDP → `assets/covers/tikko-italy.webp`
- βγάζει τις σελίδες του `--pages` για το «Look inside» (κόβει και το bleed)
- φτιάχνει τη σελίδα review `tikko-italy/`. **Αυτό είναι το link για το QR του βιβλίου:** `https://rainbowpencilpress.github.io/tikko-italy/`
- προσθέτει το βιβλίο στο `data/books.js`

Μετά:
1. Άνοιξε το `data/books.js`, βρες το νέο βιβλίο (στο τέλος της λίστας) και γράψε `description` και `highlights`.
2. Commit + push (ή upload των νέων αρχείων από το browser).

Χωρίς `--write` το script απλώς τυπώνει το κομμάτι κώδικα για να το επικολλήσεις μόνος σου.
Το `--category` είναι `tikko`, `feelings` ή `coloring`.

### Με το χέρι

1. Βάλε το εξώφυλλο στο `assets/covers/` (JPG, PNG ή WebP, ~900px πλάτος).
2. Στο `data/books.js` αντέγραψε ένα υπάρχον βιβλίο, επικόλλησέ το πάνω από τη γραμμή
   `/* NEW BOOKS: ... */` και άλλαξε τα πεδία. Πρόσεξε τα κόμματα ανάμεσα στα `{ }`.
3. Για σελίδα review: αντέγραψε το `tools/review-page-template.html` σε νέο φάκελο ως `index.html` και άλλαξε τα `{{TITLE}}`, `{{EMOJI}}`, `{{SEARCH}}`.

## Όταν ένα βιβλίο βγει live στο Amazon

Βάλε το ASIN (το βρίσκεις στο KDP Bookshelf) σε **δύο** σημεία:
1. `data/books.js` → `asin: "B0XXXXXXXX"`. Το «Coming soon» γίνεται κουμπί «Buy on Amazon» και μπαίνει badge «New».
2. Στη σελίδα review του βιβλίου (π.χ. `pimmo1/index.html`) → `var ASIN = "B0XXXXXXXX";`, ώστε το QR να ανοίγει κατευθείαν τη φόρμα review.

Βάλε και το `added` στην ημερομηνία που βγήκε live: το badge «New» φαίνεται για 45 μέρες (`newForDays`).

## Χρήσιμα links για social / TikTok / Pinterest

- `https://rainbowpencilpress.github.io/#book-dino` → ανοίγει κατευθείαν ένα βιβλίο (βάζεις το `id` του)
- `https://rainbowpencilpress.github.io/#shelf-tikko` → δείχνει μόνο μια σειρά (`tikko`, `feelings`, `coloring`)

## Amazon χώρες

Το κουμπί αγοράς ανοίγει το Amazon της χώρας του επισκέπτη (από τη γλώσσα του browser: UK → amazon.co.uk, Γερμανία και Ελλάδα → amazon.de κ.λπ.). Ο επισκέπτης μπορεί να το αλλάξει από το footer ή μέσα στο παράθυρο του βιβλίου.

## Άλλες αλλαγές

- **Νέα κατηγορία** (π.χ. ημερολόγια): στο `data/books.js` αντέγραψε ένα block στα `categories` με νέο `id`, π.χ. `calendars`. Κατηγορία χωρίς βιβλία δεν εμφανίζεται.
- **Νέος χαρακτήρας**: εικόνα με διάφανο φόντο στο `assets/characters/` και μία εγγραφή στα `characters`.
- **Free pages**: βάλε PDF στο `printables/` και άλλαξε τα 3 `<li class="sheet">` στο `index.html`.
- Οι γραμματοσειρές (Sniglet, Andika, άδεια OFL) είναι μέσα στο repo, άρα δεν γίνεται καμία κλήση στο Google Fonts.
