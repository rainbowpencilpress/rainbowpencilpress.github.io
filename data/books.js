/* ==========================================================================
   RAINBOW PENCIL PRESS: all the content of the website lives in this file.

   ADD A NEW BOOK
   1. Easiest: run   python tools/add_book.py ... --write   (see README.md).
      It makes the cover + preview images and inserts a new entry below.
   2. By hand: copy one of the book entries below, paste it above the
      "NEW BOOKS" marker and change the values.

   Fields of a book
     id          short name, also the QR review folder (e.g. "tikko-italy")
     category    one of the category ids below: "tikko", "feelings", "coloring"
     number      number inside its series (books are sorted by it)
     asin        Amazon ASIN. Leave "" while the book is not live yet:
                 the site then shows "Coming soon" instead of "Buy on Amazon".
     cover       image in assets/covers/  (leave "" for a drawn placeholder)
     previews    images for the "Look inside" gallery (can be [])
     added       date the book went live (a "New" badge shows for a few weeks)
     review      folder of the QR review page (e.g. "tikko-italy/")
   ========================================================================== */

window.RPP = {

  site: {
    name: "Rainbow Pencil Press",
    url: "https://rainbowpencilpress.github.io/",
    defaultStore: "us",   // us, uk, de, fr, it, es, nl, ca, au, ie
    newForDays: 45        // how long the "New" badge stays after `added`
  },

  /* ---------------- Series / categories ----------------
     A category without books is hidden automatically.
     To add one (e.g. calendars), copy a block and give it a new id. */
  categories: [
    {
      id: "tikko",
      name: "Adventures Around the World",
      short: "Adventures",
      series: "Tikko’s World Adventures",
      color: "#13838C",
      tint: "#E2F4F5",
      ages: "3–7",
      scene: "assets/scenes/tikko.webp",
      sceneAlt: "Tikko the penguin and Zoe the little owl walking toward the Acropolis in Athens",
      mascot: "assets/characters/tikko-wave.webp",
      blurb: "Tikko the explorer penguin visits a new country in every book, makes a new friend and discovers how wonderful the world is.",
      inside: [
        "Short, simple sentences for early readers",
        "Fun facts about each country at the end",
        "Tikko’s passport, with a new stamp in every book"
      ]
    },
    {
      id: "feelings",
      name: "Feelings & Empathy",
      short: "Feelings & empathy",
      series: "Pimmo’s Big Feelings",
      color: "#C4473B",
      tint: "#FFF0E6",
      ages: "3–6",
      scene: "assets/scenes/feelings.webp",
      sceneAlt: "Pimmo the hedgehog and his friends building a tall tower of autumn leaves",
      mascot: "assets/characters/pimmo.webp",
      blurb: "Gentle stories that help children name big feelings, calm their bodies and understand how others feel. Starring Pimmo the hedgehog and his friends in Maple Hollow.",
      inside: [
        "One big feeling in every book",
        "A calming trick little ones can use every day",
        "Talk-about-it questions for grown-ups"
      ]
    },
    {
      id: "coloring",
      name: "Coloring & Activities",
      short: "Coloring & activities",
      series: "",
      color: "#7A4FC2",
      tint: "#F1EBFC",
      ages: "4–6",
      scene: "assets/scenes/coloring.webp",
      sceneAlt: "A coloring page with a big letter C and a cute cat",
      mascot: "",
      blurb: "Big, bold, simple pictures for little hands. Children learn their letters and lots of new words while they color.",
      inside: [
        "Thick outlines that are easy to color",
        "Single-sided pages, so markers don’t bleed through",
        "The name of every animal written on its page"
      ]
    }
  ],

  /* ---------------- Books ---------------- */
  books: [
    {
      id: "tikko-greece",
      title: "Tikko and the Little Owl",
      subtitle: "An Adventure in Greece",
      category: "tikko",
      number: 1,
      asin: "",
      cover: "assets/covers/tikko-greece.webp",
      previews: [
        "assets/previews/tikko-greece-1.webp",
        "assets/previews/tikko-greece-2.webp",
        "assets/previews/tikko-greece-3.webp",
        "assets/previews/tikko-greece-4.webp"
      ],
      ages: "3–7",
      pages: 30,
      size: "8.5 × 8.5 in paperback",
      added: "2026-11-08",
      description: "Tikko the little explorer penguin is visiting sunny Greece! When a storm blows a baby owl far from home, Tikko has a plan. Penguins can’t fly, and Zoe can’t fly yet, but together they can sail, walk and climb all the way to the Acropolis. A warm early-reader adventure about friendship, courage and the wonders of Greece.",
      highlights: [
        "From the white houses of the islands to the Acropolis in Athens",
        "Fun facts about Greece at the end of the book",
        "Tikko’s passport page with the Greece stamp",
        "Short, simple sentences for early readers"
      ],
      review: "tikko-greece/"
    },
    {
      id: "pimmo1",
      title: "Pimmo and the Prickly Mad",
      subtitle: "A Story About Anger",
      category: "feelings",
      number: 1,
      asin: "",
      cover: "assets/covers/pimmo1.webp",
      previews: [
        "assets/previews/pimmo1-1.webp",
        "assets/previews/pimmo1-2.webp",
        "assets/previews/pimmo1-3.webp",
        "assets/previews/pimmo1-4.webp"
      ],
      ages: "3–6",
      pages: 28,
      size: "8.5 × 8.5 in paperback",
      added: "2026-11-08",
      description: "Pimmo is building the tallest leaf tower in Maple Hollow, until… BUMP! When his tower falls down, Pimmo feels so mad that his spikes go POP! With help from Grandma Owl and his calm pebble, Pimmo learns that it’s okay to feel mad, and how to help his body feel calm again. A gentle story about anger, with a simple breathing trick little ones can use every day.",
      highlights: [
        "Shows that feeling mad is okay, and what to do with it",
        "Pimmo’s calm breath: smell the flower, blow the candle",
        "Let’s talk about it questions for grown-ups",
        "A “How do you feel today?” page"
      ],
      review: "pimmo1/"
    },
    {
      id: "pimmo2",
      title: "Pimmo and the Torn Kite",
      subtitle: "",
      category: "feelings",
      number: 2,
      asin: "",
      cover: "",
      previews: [],
      ages: "3–6",
      pages: null,
      size: "",
      added: "",
      description: "The next story in Pimmo’s Big Feelings. Coming soon.",
      highlights: [],
      review: ""
    },
    {
      id: "dino",
      title: "Dinosaur ABC Coloring Book",
      subtitle: "Learn the Alphabet A to Z with Cute Dinosaurs",
      category: "coloring",
      number: 1,
      asin: "B0HQRBFYRC",
      cover: "assets/covers/dino.webp",
      previews: [
        "assets/previews/dino-1.webp",
        "assets/previews/dino-2.webp",
        "assets/previews/dino-3.webp",
        "assets/previews/dino-4.webp"
      ],
      ages: "4–6",
      pages: 92,
      size: "8.5 × 11 in paperback",
      added: "2026-11-05",
      description: "Learn the ABCs with friendly dinosaurs! Every letter from A to Z has its own page with a big bubble letter and a cute dinosaur to color, from Ankylosaurus to Zuniceratops, with 14 bonus prehistoric friends at the end.",
      highlights: [
        "26 letter pages from A to Z",
        "14 bonus prehistoric friends",
        "The name of every dinosaur to learn while coloring",
        "Big, bold, simple designs for little hands",
        "Single-sided pages to prevent bleed-through"
      ],
      review: "dino/"
    },
    {
      id: "animal-abc",
      title: "Animal ABC Coloring Book",
      subtitle: "Learn the Alphabet A to Z with Cute Animals",
      category: "coloring",
      number: 2,
      asin: "",
      cover: "assets/covers/animal-abc.webp",
      previews: [
        "assets/previews/animal-abc-1.webp",
        "assets/previews/animal-abc-2.webp",
        "assets/previews/animal-abc-3.webp",
        "assets/previews/animal-abc-4.webp"
      ],
      ages: "4–6",
      pages: 92,
      size: "8.5 × 11 in paperback",
      added: "2026-11-09",
      description: "Learn the ABCs with friendly animals! From Alligator to Zebra, every letter has its own page with a big bubble letter and a cute animal to color, plus 14 bonus animal friends like a panda, an octopus and a koala.",
      highlights: [
        "26 letter pages from A to Z",
        "14 bonus animal friends",
        "The name of every animal to learn while coloring",
        "Big, bold, simple designs for little hands",
        "Single-sided pages to prevent bleed-through"
      ],
      review: "animal-abc/"
    },

    /* NEW BOOKS: tools/add_book.py inserts new entries here */
  ],

  /* ---------------- Characters ----------------
     `world` must be a category id. Images live in assets/characters/. */
  characters: [
    {
      world: "tikko",
      name: "Tikko & Zoe",
      image: "assets/characters/tikko-zoe.webp",
      color: "#BFE6E8",
      text: "Tikko is a little penguin who loves to explore the world. In his backpack he keeps a map and a little red flag. In Greece he meets Zoe, a little owl who can’t fly yet."
    },
    {
      world: "feelings",
      name: "Pimmo",
      image: "assets/characters/pimmo.webp",
      color: "#FFD3C4",
      text: "A little hedgehog with a big heart. When Pimmo has a big feeling, his spikes pop up! In his pocket he keeps a smooth calm pebble from Grandma Owl."
    },
    {
      world: "feelings",
      name: "Grandma Owl",
      image: "assets/characters/grandma-owl.webp",
      color: "#E4D8F5",
      text: "Wise and gentle. She always knows how to help a prickly friend feel calm again."
    },
    {
      world: "feelings",
      name: "Bella",
      image: "assets/characters/bella.webp",
      color: "#C9EFE3",
      text: "A bouncy bunny and one of Pimmo’s best friends."
    },
    {
      world: "feelings",
      name: "Kiki",
      image: "assets/characters/kiki.webp",
      color: "#FFF0B3",
      text: "A tiny chick who loves to flutter about."
    },
    {
      world: "feelings",
      name: "Milo",
      image: "assets/characters/milo.webp",
      color: "#D6E9CF",
      text: "A shy little mole in a cozy green hat."
    },
    {
      world: "feelings",
      name: "Pimmo’s family",
      image: "assets/characters/family.webp",
      image2: "assets/characters/dad.webp",
      color: "#F3E3CF",
      text: "Mom, Dad and the baby of the family."
    }
  ]
};
