/* Rainbow Pencil Press – site logic.
   All content comes from data/books.js; you normally never need to edit this file. */
(function () {
  "use strict";

  var DATA = window.RPP || {};
  var SITE = DATA.site || {};
  var CATS = DATA.categories || [];
  var BOOKS = (DATA.books || []).filter(function (b) { return b && b.id && b.title; });
  var CHARS = DATA.characters || [];

  /* ---------------- Amazon stores ---------------- */
  var STORES = [
    { id: "us", label: "🇺🇸 United States", domain: "amazon.com" },
    { id: "uk", label: "🇬🇧 United Kingdom", domain: "amazon.co.uk" },
    { id: "de", label: "🇩🇪 Deutschland", domain: "amazon.de" },
    { id: "fr", label: "🇫🇷 France", domain: "amazon.fr" },
    { id: "it", label: "🇮🇹 Italia", domain: "amazon.it" },
    { id: "es", label: "🇪🇸 España", domain: "amazon.es" },
    { id: "nl", label: "🇳🇱 Nederland", domain: "amazon.nl" },
    { id: "ie", label: "🇮🇪 Ireland", domain: "amazon.ie" },
    { id: "ca", label: "🇨🇦 Canada", domain: "amazon.ca" },
    { id: "au", label: "🇦🇺 Australia", domain: "amazon.com.au" }
  ];
  var STORE_KEY = "rpp-store";
  // Greece, Cyprus etc. have no own store: amazon.de ships there.
  var LANG_TO_STORE = {
    "en-GB": "uk", "en-IE": "ie", "en-CA": "ca", "fr-CA": "ca", "en-AU": "au", "en-NZ": "au",
    "de": "de", "fr": "fr", "it": "it", "es-ES": "es", "nl": "nl", "el": "de", "pl": "de", "cs": "de", "pt-PT": "es"
  };

  function storeById(id) {
    for (var i = 0; i < STORES.length; i++) if (STORES[i].id === id) return STORES[i];
    return STORES[0];
  }
  function detectStore() {
    try { var saved = localStorage.getItem(STORE_KEY); if (saved) return storeById(saved).id; } catch (e) {}
    var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en-US"];
    for (var i = 0; i < langs.length; i++) {
      var l = langs[i];
      if (LANG_TO_STORE[l]) return LANG_TO_STORE[l];
      var short = l.split("-")[0];
      if (LANG_TO_STORE[short]) return LANG_TO_STORE[short];
    }
    return SITE.defaultStore || "us";
  }
  var store = storeById(detectStore());

  function amazonUrl(book) {
    return book.asin ? "https://www." + store.domain + "/dp/" + encodeURIComponent(book.asin) : "";
  }
  function storeName() { return store.domain.charAt(0).toUpperCase() + store.domain.slice(1); }

  /* ---------------- helpers ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function catById(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i];
    return { id: id || "other", name: "More books", short: "More", color: "#1F84D6", tint: "#EEF8FF", inside: [] };
  }
  function mix(hex, amount) { // blend a colour with white
    var h = String(hex).replace("#", "");
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    var c = [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
    return "rgb(" + c.map(function (v) { return Math.round(v + (255 - v) * amount); }).join(",") + ")";
  }
  function catStyle(cat) {
    return "--c:" + cat.color + ";--t:" + (cat.tint || mix(cat.color, .88)) + ";--ledge:" + mix(cat.color, .62);
  }
  function isNew(book) {
    if (!book.asin || !book.added) return false;
    var days = (Date.now() - new Date(book.added + "T00:00:00").getTime()) / 864e5;
    return days >= 0 && days <= (SITE.newForDays || 45);
  }
  function booksIn(catId) {
    return BOOKS.filter(function (b) { return b.category === catId; }).sort(function (a, b) {
      var live = (b.asin ? 1 : 0) - (a.asin ? 1 : 0);
      if (!a.cover !== !b.cover) return a.cover ? -1 : 1;           // placeholders last
      return (a.number || 99) - (b.number || 99) || live;
    });
  }
  function seriesLine(book, cat) {
    if (cat.series && book.number) return "Book " + book.number + " of " + cat.series;
    return cat.series || cat.name;
  }
  var activeCats = CATS.filter(function (c) { return booksIn(c.id).length > 0; });
  BOOKS.forEach(function (b) { // books with an unknown category still get shown
    if (!activeCats.some(function (c) { return c.id === b.category; })) activeCats.push(catById(b.category));
  });

  function toast(msg) {
    var t = el("div", { "class": "toast", role: "status", text: msg });
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  /* ---------------- series panels ---------------- */
  function renderSeries() {
    var box = $("#series-list");
    if (!box) return;
    activeCats.forEach(function (cat) {
      var n = booksIn(cat.id).length;
      box.appendChild(el("article", { "class": "series-panel", style: catStyle(cat) }, [
        cat.scene ? el("div", { "class": "scene" }, [el("img", { src: cat.scene, alt: cat.sceneAlt || "", loading: "lazy", width: 960, height: 720 })]) : null,
        el("div", { "class": "series-body" }, [
          el("h3", { text: cat.name }),
          el("p", { "class": "series-sub", text: [cat.series, cat.ages ? "Ages " + cat.ages : ""].filter(Boolean).join(", ") }),
          el("p", { "class": "blurb", text: cat.blurb || "" }),
          (cat.inside && cat.inside.length) ? el("ul", { "class": "inside", "aria-label": "Inside every book" },
            cat.inside.map(function (t) { return el("li", { text: t }); })) : null,
          el("a", { "class": "btn btn-small", href: "#shelf-" + cat.id, text: n === 1 ? "See the book" : "See the " + n + " books" })
        ])
      ]));
    });
  }

  /* ---------------- filters + shelves ---------------- */
  var filter = "all";

  function renderFilters() {
    var box = $("#filters");
    if (!box) return;
    var all = [{ id: "all", short: "All books", color: "#FFC93C" }].concat(activeCats);
    all.forEach(function (cat) {
      box.appendChild(el("button", {
        type: "button", "class": "pencil", "data-filter": cat.id, "aria-pressed": "false",
        style: "--c:" + cat.color, text: cat.short || cat.name,
        onclick: function () { setFilter(cat.id, false); }
      }));
    });
  }

  function setFilter(id, scroll) {
    filter = activeCats.some(function (c) { return c.id === id; }) ? id : "all";
    document.querySelectorAll(".pencil").forEach(function (p) {
      p.setAttribute("aria-pressed", String(p.getAttribute("data-filter") === filter));
    });
    document.querySelectorAll(".shelf").forEach(function (s) {
      s.hidden = !(filter === "all" || s.getAttribute("data-cat") === filter);
    });
    var title = $("#books-title");
    if (title) title.textContent = filter === "all" ? "All books" : catById(filter).name;
    if (scroll) $("#books").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function coverNode(book, cat, badge) {
    if (book.cover) {
      return el("span", { "class": "book3d" }, [el("img", { src: book.cover, alt: "", loading: "lazy" }), badge]);
    }
    return el("span", { "class": "book3d placeholder" }, [
      el("strong", { text: book.title }),
      cat.mascot ? el("img", { src: cat.mascot, alt: "", loading: "lazy" }) : null,
      badge
    ]);
  }
  function coverRatio(book) { // height / width, read from e.g. "8.5 × 11 in paperback"
    var m = String(book.size || "").match(/([\d.]+)\s*[×x]\s*([\d.]+)/);
    if (m) return parseFloat(m[2]) / parseFloat(m[1]);
    return book.cover ? 11 / 8.5 : 1;
  }

  function bookCard(book, cat) {
    var url = amazonUrl(book);
    var badge = !book.asin ? el("span", { "class": "badge soon", text: "Coming soon" })
      : isNew(book) ? el("span", { "class": "badge", text: "New" }) : null;
    var open = function () { openBook(book.id); };
    return el("article", { "class": "book", "data-id": book.id }, [
      el("button", { type: "button", "class": "cover-btn", "aria-label": "Look inside " + book.title, onclick: open }, [
        el("span", { "class": "cover-box" }, [coverNode(book, cat, badge)])
      ]),
      el("div", { "class": "book-meta" }, [
        cat.series ? el("p", { "class": "book-series", text: seriesLine(book, cat) }) : null,
        el("h4", { "class": "book-title" }, [el("button", { type: "button", onclick: open, text: book.title })]),
        book.subtitle ? el("p", { "class": "book-sub", text: book.subtitle }) : null,
        book.ages ? el("p", { "class": "book-age", text: "Ages " + book.ages }) : null,
        el("div", { "class": "book-actions" }, [
          url ? el("a", { "class": "btn btn-primary btn-small buy-link", href: url, target: "_blank", rel: "noopener", "data-id": book.id, text: "Buy on Amazon" })
              : el("span", { "class": "soon-note", text: "Coming soon to Amazon" }),
          (book.previews && book.previews.length) ? el("button", { type: "button", "class": "linklike", onclick: open, text: "Look inside" }) : null
        ])
      ])
    ]);
  }

  function renderShelves() {
    var box = $("#shelves");
    if (!box) return;
    activeCats.forEach(function (cat) {
      var list = booksIn(cat.id);
      var r = Math.max.apply(null, list.map(coverRatio).concat([1]));
      box.appendChild(el("div", { "class": "shelf", id: "shelf-" + cat.id, "data-cat": cat.id, style: catStyle(cat) + ";--r:" + r.toFixed(3) }, [
        el("div", { "class": "shelf-head" }, [
          el("h3", { text: cat.name }),
          cat.series ? el("p", { text: cat.series }) : null
        ]),
        el("div", { "class": "book-grid" }, list.map(function (b) { return bookCard(b, cat); }))
      ]));
    });
  }

  /* ---------------- characters ---------------- */
  function renderCharacters() {
    var box = $("#character-worlds");
    if (!box) return;
    var worlds = [];
    CHARS.forEach(function (c) { if (worlds.indexOf(c.world) < 0) worlds.push(c.world); });
    worlds.forEach(function (w) {
      var cat = catById(w);
      var hasBooks = booksIn(w).length > 0;
      box.appendChild(el("div", { "class": "world world-" + w, style: catStyle(cat) }, [
        el("div", { "class": "world-head" }, [
          el("h3", { text: cat.series || cat.name }),
          hasBooks ? el("a", { href: "#shelf-" + w, text: "See the books" }) : null
        ]),
        el("div", { "class": "char-grid" }, CHARS.filter(function (c) { return c.world === w; }).map(function (c) {
          var imgs = [el("img", { src: c.image, alt: "", loading: "lazy" })];
          if (c.image2) imgs.unshift(el("img", { src: c.image2, alt: "", loading: "lazy" }));
          return el("article", { "class": "char" }, [
            el("div", { "class": "char-art" + (c.image2 ? " duo" : ""), style: "--bg:" + (c.color || cat.tint), role: "img", "aria-label": c.name }, imgs),
            el("div", {}, [el("h4", { text: c.name }), el("p", { text: c.text })])
          ]);
        }))
      ]));
    });
  }

  /* ---------------- review links + footer ---------------- */
  function renderReviewLinks() {
    var box = $("#review-links");
    var live = BOOKS.filter(function (b) { return b.review && b.asin; });
    if (box) live.forEach(function (b) {
      box.appendChild(el("li", {}, [el("a", { "class": "btn btn-small", href: b.review, text: b.title })]));
    });
    var section = box && box.closest("section");
    if (section && !live.length) section.hidden = true;
    var fs = $("#footer-series");
    if (fs) activeCats.forEach(function (c) {
      fs.appendChild(el("li", {}, [el("a", { href: "#shelf-" + c.id, text: c.name })]));
    });
    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------- store pickers ---------------- */
  function fillStoreSelect(sel) {
    sel.innerHTML = "";
    STORES.forEach(function (s) {
      sel.appendChild(el("option", { value: s.id, text: s.label + " (" + s.domain + ")", selected: s.id === store.id }));
    });
    sel.addEventListener("change", function () { setStore(sel.value); });
  }
  function setStore(id) {
    store = storeById(id);
    try { localStorage.setItem(STORE_KEY, store.id); } catch (e) {}
    document.querySelectorAll(".buy-link").forEach(function (a) {
      var b = BOOKS.filter(function (x) { return x.id === a.getAttribute("data-id"); })[0];
      if (b) a.href = amazonUrl(b);
    });
    document.querySelectorAll("select.store").forEach(function (s) { s.value = store.id; });
    if (current) renderBuy(current);
  }

  /* ---------------- book dialog ---------------- */
  var dlg = $("#book-dialog");
  var current = null, pages = [], pageIndex = 0, lastFocus = null;

  function renderBuy(book) {
    var box = $("#dlg-buy");
    box.innerHTML = "";
    var url = amazonUrl(book);
    if (url) {
      box.appendChild(el("a", { "class": "btn btn-primary buy-link", href: url, target: "_blank", rel: "noopener", "data-id": book.id, text: "Buy on " + storeName() }));
      var sel = el("select", { "class": "store", id: "dlg-store", "aria-label": "Amazon store" });
      box.appendChild(el("label", { "class": "store-pick", "for": "dlg-store" }, ["Other country?", sel]));
      fillStoreSelect(sel);
    } else {
      box.appendChild(el("p", { "class": "soon-box", text: "Coming soon to Amazon. Check back in a little while!" }));
    }
  }

  function showPage(i) {
    if (!pages.length) return;
    pageIndex = (i + pages.length) % pages.length;
    var img = $("#dlg-image");
    img.src = pages[pageIndex];
    img.alt = pageIndex === 0 && current.cover ? "Cover of " + current.title : "Page from " + current.title + " (" + pageIndex + " of " + (pages.length - 1) + ")";
    document.querySelectorAll("#dlg-thumbs button").forEach(function (b, k) {
      b.setAttribute("aria-current", String(k === pageIndex));
    });
  }

  function openBook(id, fromHash) {
    var book = BOOKS.filter(function (b) { return b.id === id; })[0];
    if (!book || !dlg) return;
    current = book;
    var cat = catById(book.category);
    dlg.setAttribute("style", catStyle(cat));
    $("#dlg-series").textContent = seriesLine(book, cat);
    $("#dlg-title").textContent = book.title;
    var sub = $("#dlg-subtitle");
    sub.textContent = book.subtitle || "";
    sub.hidden = !book.subtitle;

    var facts = $("#dlg-facts");
    facts.innerHTML = "";
    [book.ages ? "Ages " + book.ages : "", book.pages ? book.pages + " pages" : "", book.size || ""]
      .filter(Boolean).forEach(function (f) { facts.appendChild(el("li", { text: f })); });

    $("#dlg-desc").textContent = book.description || "";
    var hl = $("#dlg-highlights");
    hl.innerHTML = "";
    (book.highlights || []).forEach(function (h) { hl.appendChild(el("li", { text: h })); });

    renderBuy(book);

    var rv = $("#dlg-review");
    if (book.review && book.asin) { rv.href = book.review; rv.hidden = false; } else { rv.hidden = true; }

    pages = (book.cover ? [book.cover] : []).concat(book.previews || []);
    var gallery = $(".dlg-gallery");
    gallery.hidden = pages.length === 0;
    var thumbs = $("#dlg-thumbs");
    thumbs.innerHTML = "";
    pages.forEach(function (src, k) {
      thumbs.appendChild(el("button", { type: "button", "aria-label": k === 0 && book.cover ? "Cover" : "Page " + k, onclick: function () { showPage(k); } },
        [el("img", { src: src, alt: "", loading: "lazy" })]));
    });
    thumbs.hidden = pages.length < 2;
    $("#dlg-prev").hidden = $("#dlg-next").hidden = pages.length < 2;
    showPage(0);

    if (!dlg.open) {
      lastFocus = document.activeElement;
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    }
    $(".dlg-info").scrollTop = 0;
    if (!fromHash) history.replaceState(null, "", "#book-" + book.id);
  }

  function closeBook() {
    if (!dlg) return;
    if (dlg.open) { if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
  }

  if (dlg) {
    dlg.addEventListener("close", function () {
      current = null;
      if (/^#book-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeBook(); });
    $("#dlg-close").addEventListener("click", closeBook);
    $("#dlg-prev").addEventListener("click", function () { showPage(pageIndex - 1); });
    $("#dlg-next").addEventListener("click", function () { showPage(pageIndex + 1); });
    dlg.addEventListener("keydown", function (e) {
      if (e.target && /SELECT|INPUT/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft") showPage(pageIndex - 1);
      if (e.key === "ArrowRight") showPage(pageIndex + 1);
    });
    $("#dlg-copy").addEventListener("click", function () {
      if (!current) return;
      var link = SITE.url ? SITE.url.replace(/\/?$/, "/") + "#book-" + current.id : location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { toast("Link copied"); }, function () { prompt("Copy this link:", link); });
      else prompt("Copy this link:", link);
    });
  }

  /* ---------------- links like #book-dino or #shelf-tikko ---------------- */
  function route() {
    var h = decodeURIComponent(location.hash || "");
    if (h.indexOf("#book-") === 0) {
      var id = h.slice(6);
      var b = BOOKS.filter(function (x) { return x.id === id; })[0];
      if (b) { setFilter(b.category, false); openBook(id, true); }
    } else if (h.indexOf("#shelf-") === 0) {
      closeBook();
      setFilter(h.slice(7), true);
    }
  }

  /* ---------------- feelings check-in ---------------- */
  var FEELINGS = {
    happy:  { tail: "12%", text: ["Hooray for happy days!", "What made you smile today? Tell someone you love about it."] },
    mad:    { tail: "37%", text: ["It’s okay to feel mad. Pimmo feels mad sometimes too.", "Let’s help your body feel calm again, just like Pimmo did."], breath: true },
    sad:    { tail: "62%", text: ["It’s okay to feel sad.", "A hug, a cuddly toy or a quiet talk with a grown-up can help a sad feeling get smaller."] },
    scared: { tail: "86%", text: ["Feeling scared is okay.", "Hold a grown-up’s hand and take a slow, deep breath together."], breath: true }
  };
  function initFeelings() {
    var reply = $("#feel-reply");
    if (!reply) return;
    document.querySelectorAll(".face").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-feel"), f = FEELINGS[key];
        document.querySelectorAll(".face").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        reply.style.setProperty("--tail", f.tail);
        reply.innerHTML = "";
        f.text.forEach(function (t) { reply.appendChild(el("p", { text: t })); });
        if (f.breath) reply.appendChild(el("a", { "class": "btn btn-small", href: "#calm-breath", text: "Try Pimmo’s calm breath",
          onclick: function () { setTimeout(function () { var b = $("#breath-btn"); if (b) b.focus({ preventScroll: true }); }, 400); } }));
      });
    });
  }

  /* ---------------- Pimmo's calm breath ---------------- */
  function initBreath() {
    var card = $("#calm-breath"), btn = $("#breath-btn"), prompt = $("#breath-prompt");
    if (!card || !btn) return;
    var timers = [], running = false, ROUNDS = 3, IN = 4000, OUT = 5000;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function stop(msg) {
      timers.forEach(clearTimeout); timers = [];
      running = false;
      card.classList.remove("inhale", "exhale");
      btn.textContent = "Start breathing";
      prompt.textContent = msg || "Ready when you are.";
    }
    function round(n) {
      card.classList.remove("exhale"); card.classList.add("inhale");
      prompt.textContent = "Smell the flower… breathe in (" + n + " of " + ROUNDS + ")";
      later(function () {
        card.classList.remove("inhale"); card.classList.add("exhale");
        prompt.textContent = "Blow the candle… breathe out slowly";
        later(function () {
          if (n < ROUNDS) round(n + 1);
          else stop("Your spikes are soft again. Well done!");
        }, OUT);
      }, IN);
    }
    btn.addEventListener("click", function () {
      if (running) { stop(); return; }
      running = true;
      btn.textContent = "Stop";
      round(1);
    });
  }

  /* ---------------- structured data for search engines ---------------- */
  function addJsonLd() {
    var base = (SITE.url || location.origin + "/").replace(/\/?$/, "/");
    var org = { "@type": "Organization", "@id": base + "#org", name: SITE.name || "Rainbow Pencil Press", url: base, logo: base + "assets/img/icon-512.png" };
    var books = BOOKS.filter(function (b) { return b.cover; }).map(function (b) {
      var o = {
        "@type": "Book", name: b.title + (b.subtitle ? ": " + b.subtitle : ""), url: base + "#book-" + b.id,
        image: base + b.cover, author: { "@id": base + "#org" }, publisher: { "@id": base + "#org" },
        bookFormat: "https://schema.org/Paperback", inLanguage: "en", description: b.description || ""
      };
      if (b.ages) o.typicalAgeRange = b.ages.replace("–", "-");
      if (b.pages) o.numberOfPages = b.pages;
      if (b.asin) o.sameAs = "https://www.amazon.com/dp/" + b.asin;
      return o;
    });
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": [org].concat(books) });
    document.head.appendChild(s);
  }

  /* ---------------- go ---------------- */
  renderSeries();
  renderFilters();
  renderShelves();
  renderCharacters();
  renderReviewLinks();
  var footerSel = $("#store-select");
  if (footerSel) { footerSel.classList.add("store"); fillStoreSelect(footerSel); }
  setFilter("all", false);
  initFeelings();
  initBreath();
  addJsonLd();
  window.addEventListener("hashchange", route);
  document.addEventListener("click", function (e) { // shelf links also work when clicked twice
    var a = e.target.closest && e.target.closest('a[href^="#shelf-"]');
    if (!a) return;
    e.preventDefault();
    setFilter(a.getAttribute("href").slice(7), true);
    history.replaceState(null, "", a.getAttribute("href"));
  });
  route();
})();
