/* ==========================================================================
   Everything you might want to edit lives here: words, links, photos.
   Photos: drop the file in assets/img/ and put its path in "photo" or "image".
   Leave a photo as "" and the site shows its designed placeholder instead.
   ========================================================================== */

export const links = {
  email: "dee.vag78@gmail.com",
  linkedin: "",                  // paste your LinkedIn URL: a LinkedIn stamp appears in the footer
  resume: "assets/Deeva_Gupta_Resume.pdf", // your résumé PDF: shows a Résumé pill in the nav and a stamp in the footer
  caseStudy: "astroverse.html",
};

/* Send-a-postcard (the contact section).
   firebase: your Realtime Database URL. Every card is saved to /inbox (private:
   message, name, email, stamp). If the visitor ticks "Pin it to the wall", a public
   copy (first name + message) goes to /wall with approved: false. Flip approved to
   true in the Firebase console and it appears on the wall.
   endpoint: an optional form service (Formspree…) used only if firebase is "".
   With neither, or if saving fails, "Drop it in" opens the visitor's email app.
   assets/data/postcards.json holds your own pinned card(s). */
export const postcard = {
  firebase: "https://portfolio-3f7c6-default-rtdb.firebaseio.com",
  endpoint: "",
  maxLength: 400,
};

/* The trail in the hero. x / y = where the stop sits on the illustration
   (0–1 from the left / top of assets/img/trail.jpg). The last stop is the
   summit: the team I join next. */
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
    id: "next", x: 0.85, y: 0.141,
    pin: "Your team · next",
    when: "Next",
    title: "Your team",
    role: "The next summit",
    body: "I'm looking for a team building a consumer product people return to, where design sits next to product and data from day one.",
    note: "",
    link: { label: "Say hello", href: "#hello" },
  },
];

/* Selected work: postcards, front and back side by side.
   tint: blush | wheat | sage | slate. kind: "app" (phones) or "web" (browser).
   image: a real screenshot or mockup (leave "" for the drawn placeholder).
   video: path without extension to a looping mockup (.webm + .mp4 + -poster.jpg). */
export const work = [
  {
    id: "astroverse",
    label: "Astroverse 2.0 · Dating",
    tint: "blush",
    kind: "app",
    image: "",
    video: "assets/video/astroverse",
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
    video: "assets/video/horocosmo",
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
    label: "Wishup · App",
    tint: "sage",
    kind: "app",
    image: "",
    video: "assets/video/wishup",
    stamp: "WU",
    year: "2023",
    title: "One app for clients, VAs and Wishup",
    problem: "Client–VA work lived in Slack threads, email and hand-written EOD reports.",
    role: "Product designer on the client app, working with our design manager.",
    metric: "~15%",
    metricLabel: "VA time saved on EOD reports",
    link: { label: "Read the case study", href: "wishup.html" },
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

/* Websites & brands: the souvenir shelf. image: "" shows a drawn placeholder.
   video (optional): base path of a recording in assets/video (name.webm, name.mp4, name-poster.jpg); it plays on hover.
   href (optional) turns the card into a link to a short case study; stats and cta show on that card. */
export const sites = [
  { name: "Astroverse", kind: "Landing page", who: "Buildd", image: "", video: "assets/video/site-astroverse", tint: "blush" },
  { name: "Astrologer Arvind Sud", kind: "Report landing pages", who: "ScaleX client", image: "assets/img/work-arvind.jpg", video: "assets/video/site-arvind", tint: "slate" },
  { name: "BeerBiceps SkillHouse", kind: "Program landing page", who: "ScaleX client", image: "", tint: "wheat" },
  { name: "Vegapay", kind: "Brand identity & website", who: "Hucentric", image: "", tint: "sage" },
  { name: "Wishup", kind: "Lead-gen website", who: "Hucentric", image: "", tint: "blush", stats: "+25% pageviews · −15% bounce · 10% lead conversion", href: "wishup-website.html", cta: "Read the short case study" },
  { name: "Sketchnote · Dexter Ventures · Elevare", kind: "Webflow sites", who: "Hucentric", image: "", tint: "slate" },
];

/* Off the clock: fridge door magnets.
   image: the souvenir magnet (transparent PNG/WebP in assets/img/magnets/).
   w: how wide it sits on the fridge, in px (it scales down on phones).
   photo: an optional travel photo for the tip card (otherwise it shows the magnet).
   A place without an image falls back to a coloured text magnet (color + shape: rect | round | tri).
   sample: true shows a small "sample" mark until you swap in your own tip. */
export const places = [
  { name: "Nainital",        state: "Uttarakhand", kind: "Lake town",    image: "assets/img/magnets/nainital.webp",        w: 190, photo: "", tip: "Row across the lake at 7 am, before the boats crowd in.", who: "", sample: true },
  { name: "Mussoorie",       state: "Uttarakhand", kind: "Hill station", image: "assets/img/magnets/mussoorie.webp",       w: 112, photo: "", tip: "Walk up to Lal Tibba at sunrise. The snow peaks show up before the haze does.", who: "", sample: true },
  { name: "McLeodganj",      state: "Himachal",    kind: "Little Lhasa", image: "assets/img/magnets/mcleodganj.webp",      w: 128, photo: "", tip: "Walk the kora around the temple at dusk, with the monks.", who: "", sample: true },
  { name: "Udaipur",         state: "Rajasthan",   kind: "City of Lakes", image: "assets/img/magnets/udaipur.webp",        w: 126, photo: "", tip: "Take the last boat on Lake Pichola and watch the City Palace light up.", who: "", sample: true },
  { name: "Jaipur",          state: "Rajasthan",   kind: "Pink City",    image: "assets/img/magnets/jaipur.webp",          w: 150, photo: "", tip: "See Hawa Mahal from the rooftop cafés across the road, not the street.", who: "", sample: true },
  { name: "Jibhi",           state: "Himachal",    kind: "Valley",       image: "assets/img/magnets/jibhi.webp",           w: 96,  photo: "", tip: "Carry cash. The nearest ATM is a long way down the valley.", who: "", sample: true },
  { name: "Jaisalmer",       state: "Rajasthan",   kind: "Golden City",  image: "assets/img/magnets/jaisalmer.webp",       w: 132, photo: "", tip: "Skip the safari crowds. Ask for Khuri village.", who: "", sample: true },
  { name: "Floating Market", state: "Thailand",    kind: "Market",       image: "assets/img/magnets/floating-market.webp", w: 140, photo: "", tip: "Get there by 7 am, before the tour buses, and eat straight off the boats.", who: "", sample: true },
];
