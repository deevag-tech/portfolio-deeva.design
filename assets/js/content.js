/* ==========================================================================
   Everything you might want to edit lives here: words, links, photos.
   Photos: drop the file in assets/img/ and put its path in "photo" or "image".
   Leave a photo as "" and the site shows its designed placeholder instead.
   ========================================================================== */

export const links = {
  email: "dee.vag78@gmail.com",
  linkedin: "",                  // paste your LinkedIn URL to show it in the footer
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

/* Selected work: postcards. front.tint is one of: blush, wheat, sage, slate.
   front.image: a real screenshot or mockup (leave "" for the drawn placeholder). */
export const work = [
  {
    id: "astroverse",
    label: "Astroverse 2.0 · Dating",
    tint: "blush",
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

/* Astroverse 2.0: every hat. */
export const hats = [
  { icon: "research", title: "Research", body: "User calls and Mixpanel funnels to find exactly where people dropped off.", tool: "Mixpanel · user calls" },
  { icon: "strategy", title: "Product strategy", body: "Set the north star for 2.0: fewer profiles, better matches.", tool: "Discover V3 · Pro tiers" },
  { icon: "ui", title: "UX & UI", body: "Rebuilt onboarding, Discover and the Kundli, and gave the app a new identity.", tool: "Figma" },
  { icon: "writing", title: "UX writing", body: "Every string in English and Hinglish, from onboarding to push notifications.", tool: "OneSignal" },
  { icon: "ai", title: "AI conversation design", body: "Veda’s conversation UX, session logic and the system prompt behind it.", tool: "System prompt · pricing A/B test" },
  { icon: "delivery", title: "Analytics & delivery", body: "Tracking plans, dashboards and tickets with clear acceptance criteria.", tool: "Mixpanel · Jira" },
];

export const astroStats = [
  { value: "26K+", label: "Kundli profiles created" },
  { value: "~88%", label: "finish onboarding" },
  { value: "23→38%", label: "likes share in Discover" },
  { value: "11K+", label: "questions asked to Veda" },
];

/* Websites & brands: the souvenir shelf. image: "" shows a drawn placeholder. */
export const sites = [
  { name: "Astrologer Arvind Sud", kind: "Report landing pages", who: "ScaleX client", image: "assets/img/work-arvind.jpg", tint: "slate" },
  { name: "BeerBiceps SkillHouse", kind: "Program landing page", who: "ScaleX client", image: "", tint: "wheat" },
  { name: "Vegapay", kind: "Brand identity & website", who: "Hucentric", image: "", tint: "sage" },
  { name: "Wishup", kind: "Lead-gen website", who: "Hucentric", image: "", tint: "blush" },
  { name: "Sketchnote · Dexter Ventures · Elevare", kind: "Webflow sites", who: "Hucentric", image: "", tint: "slate" },
];

/* How I work: five switchbacks. */
export const process = [
  { title: "Find the signal", body: "Funnels in Mixpanel and calls with real users show where people actually get stuck." },
  { title: "Name the insight", body: "One sentence the whole team can repeat, before any pixels." },
  { title: "Design the smallest move", body: "Sketch options and pick the change that tests the idea fastest." },
  { title: "Write the words", body: "Copy is design: every label, empty state and notification." },
  { title: "Ship and measure", body: "Tickets with clear acceptance criteria, then back to Mixpanel to see if it moved." },
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
