/* ==========================================================================
   Everything you might want to edit lives here: words, links, photos.
   Photos: drop the file in assets/img/ and put its path in "photo" or "image".
   Leave a photo as "" and the site shows its designed placeholder instead.
   ========================================================================== */

export const links = {
  email: "dee.vag78@gmail.com",
  linkedin: "",                  // paste your LinkedIn URL: a LinkedIn stamp appears in the footer
  resume: "",                    // path or URL to your résumé PDF: a Résumé stamp appears in the footer
  caseStudy: "astroverse.html",
};

/* Send-a-postcard (the contact section).
   endpoint: leave "" and "Stamp & send" opens the visitor's email app with the
   postcard already written. Paste a form endpoint (Formspree, Web3Forms, Getform…)
   to receive postcards straight to your inbox instead, no email app needed.
   The wall shows only the cards you approve in assets/data/postcards.json. */
export const postcard = {
  endpoint: "",
  maxLength: 400,
};

/* The trail in the hero. x / y = where the stop sits on the illustration
   (0–1 from the left / top of assets/img/trail.jpg). */
export const stops = [
  {
    id: "btech", x: 0.856, y: 0.772,
    pin: "B.Tech · 2018",
    when: "2018",
    title: "B.Tech, Computer Science",
    role: "Dr. A.P.J. Abdul Kalam Technical University",
    body: "Where I learned how software is built, which is why I still talk to engineers in their language.",
    note: "engineer by degree",
  },
  {
    id: "hucentric", x: 0.619, y: 0.646,
    pin: "Hucentric · 2022",
    when: "Mar 2022 – Dec 2023",
    title: "Hucentric",
    role: "UI/UX Designer · design agency",
    body: "Wishup’s lead-gen site (+25% pageviews), Vegapay’s brand and website, and Webflow builds for Sketchnote, Dexter Ventures and Elevare.",
    note: "",
  },
  {
    id: "freelance", x: 0.828, y: 0.515,
    pin: "Freelance · 2024",
    when: "Jan – May 2024",
    title: "Freelance",
    role: "Product designer · web and mobile",
    body: "Product design for web and mobile clients, from first flows to handoff.",
    note: "",
  },
  {
    id: "scalex", x: 0.724, y: 0.322,
    pin: "ScaleX · 2024",
    when: "Jun 2024 – now",
    title: "ScaleX",
    role: "Founding Product Designer",
    body: "Client launches like Horocosmo (100K+ downloads in month one), Arvind Sud’s report pages and BeerBiceps SkillHouse, alongside our own product.",
    note: "first designer in the room",
  },
  {
    id: "astroverse", x: 0.85, y: 0.141,
    pin: "Astroverse 2.0 · now",
    when: "Dec 2025 – Sep 2026",
    title: "Astroverse 2.0",
    role: "ScaleX’s own dating app",
    body: "I rebuilt it from a swipe clone into a curated, Kundli-first product with an AI astrologer that gives people a reason to come back.",
    note: "",
    link: { label: "Read the case study", href: "astroverse.html" },
  },
];

/* Selected work: postcards, front and back side by side.
   tint: blush | wheat | sage | slate. kind: "app" (phones) or "web" (browser).
   image: a real screenshot or mockup (leave "" for the drawn placeholder). */
export const work = [
  {
    id: "astroverse",
    label: "Astroverse 2.0 · Dating",
    tint: "blush",
    kind: "app",
    image: "",
    stamp: "AV",
    year: "2026",
    title: "Fewer profiles, better matches",
    problem: "A swipe clone with a compatibility score nobody could read.",
    role: "Founding designer: research, IA, UI, UX writing, analytics.",
    metric: "23→38%",
    metricLabel: "of Discover decisions are likes",
    link: { label: "Read the case study", href: "astroverse.html" },
  },
  {
    id: "horocosmo",
    label: "Horocosmo · Astrology",
    tint: "wheat",
    kind: "app",
    image: "",
    stamp: "HC",
    year: "2024",
    title: "A celebrity astrologer’s app, from blank canvas to launch",
    problem: "Astro Arun Pandit needed his own app, built from scratch.",
    role: "Set the entire UI base: design system, core flows, launch screens.",
    metric: "100K+",
    metricLabel: "downloads in the first month",
    link: { label: "Ask me about it", href: "#hello" },
  },
  {
    id: "wishup",
    label: "Wishup · SaaS website",
    tint: "sage",
    kind: "web",
    image: "",
    stamp: "WU",
    year: "2023",
    title: "A lead-gen website, rebuilt from heatmaps",
    problem: "A lead-generation site that needed to convert better.",
    role: "Lead UI/UX designer: Clarity heatmaps, stakeholder interviews, redesign.",
    metric: "+25%",
    metricLabel: "pageviews · −15% bounce · 10% lead conversion",
    link: { label: "Ask me about it", href: "#hello" },
  },
];

/* How I work: the same five switchbacks on every project, the hat I wear at
   each, and where it showed up in real work. Every number comes from shipped work.
   art: signal | note | phones | copy | ledger (how the window draws it). */
export const steps = [
  {
    title: "Find the signal", hat: "Researcher", tools: ["Mixpanel", "Clarity", "User calls"], art: "signal",
    did: "I start with what people actually do: funnels, heatmaps and a handful of user calls. I'm looking for the one or two signals worth acting on, not a long list of findings.",
    proof: "Wishup: Clarity heatmaps and stakeholder interviews set the brief for the redesign.",
  },
  {
    title: "Name the insight", hat: "Product strategist", tools: ["North-star doc", "Team crit"], art: "note",
    did: "I turn the signal into one sentence the whole team can repeat. Every decision after that gets checked against it.",
    proof: "Astroverse 2.0: “Fewer profiles, better matches” steered a full rebuild.",
  },
  {
    title: "Design the smallest move", hat: "UX & UI designer", tools: ["Figma", "Design systems"], art: "phones",
    did: "I look for the smallest change that fixes the problem, then build it on a system the next ten screens can reuse.",
    proof: "Horocosmo: I set the whole UI base, from the design system to the launch screens.",
  },
  {
    title: "Write the words", hat: "UX writer", tools: ["Figma", "Copy deck"], art: "copy",
    did: "I write the interface copy myself, from the user's side of the screen. The right ask at the right moment does more than another screen.",
    proof: "Astroverse 2.0: verification became an invitation, asked after 3 likes instead of at sign-up.",
  },
  {
    title: "Ship and measure", hat: "Analyst · PM", tools: ["Jira", "Mixpanel"], art: "ledger",
    did: "I write the tickets with clear acceptance criteria, stay close to the build, then read the numbers to see whether it worked.",
    proof: "Three products, three kinds of result: an app launch, a SaaS website and a rebuild.",
  },
];

/* The toolbox row under How I work. */
export const tools = ["Figma", "Mixpanel", "Jira", "Clarity", "Webflow", "Claude"];

/* Websites & brands: the souvenir shelf. image: "" shows a drawn placeholder. */
export const sites = [
  { name: "Astrologer Arvind Sud", kind: "Report landing pages", who: "ScaleX client", image: "assets/img/work-arvind.jpg", tint: "slate" },
  { name: "BeerBiceps SkillHouse", kind: "Program landing page", who: "ScaleX client", image: "", tint: "wheat" },
  { name: "Vegapay", kind: "Brand identity & website", who: "Hucentric", image: "", tint: "sage" },
  { name: "Wishup", kind: "Lead-gen website", who: "Hucentric", image: "", tint: "blush" },
  { name: "Sketchnote · Dexter Ventures · Elevare", kind: "Webflow sites", who: "Hucentric", image: "", tint: "slate" },
];

/* Off the clock: fridge door magnets.
   sample: true shows a small "sample" mark until you swap in your own story. */
export const places = [
  { name: "Kedarkantha", state: "Uttarakhand", kind: "Trek",      color: "#2F4A3B", shape: "rect",   photo: "", tip: "Start before 4 am. The summit is yours at sunrise.", who: "", sample: true },
  { name: "Hampi",       state: "Karnataka",   kind: "Ruins",     color: "#C2553A", shape: "round", photo: "", tip: "Cross the river by coracle for the quieter side.", who: "", sample: true },
  { name: "Spiti",       state: "Himachal",    kind: "Road trip", color: "#5C544A", shape: "rect",  photo: "", tip: "Eat at a homestay, not a café.", who: "", sample: true },
  { name: "Rishikesh",   state: "Uttarakhand", kind: "River",     color: "#3E6B6B", shape: "round", photo: "", tip: "The evening aarti at Triveni Ghat is the one locals go to.", who: "", sample: true },
  { name: "Jaisalmer",   state: "Rajasthan",   kind: "Desert",    color: "#D99A2B", shape: "rect",  photo: "", tip: "Skip the safari crowds. Ask for Khuri village.", who: "", sample: true },
  { name: "Coorg",       state: "Karnataka",   kind: "Coffee",    color: "#5E6F3E", shape: "tri",   photo: "", tip: "Buy coffee from the estate, not the highway shop.", who: "", sample: true },
  { name: "Tawang",      state: "Arunachal",   kind: "Monastery", color: "#8E3B32", shape: "tri",  photo: "", tip: "Carry your permit copy, always.", who: "", sample: true },
  { name: "Gokarna",     state: "Karnataka",   kind: "Coast",     color: "#2C4D5A", shape: "round", photo: "", tip: "Walk the beach trail from Kudle to Paradise.", who: "", sample: true },
];
