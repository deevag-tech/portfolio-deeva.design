/* ==========================================================================
   Editable content. Change text, links and photos here.
   Photos: drop files in assets/img/ and set the path, e.g. "assets/img/hampi.jpg".
   Leave a photo as "" to keep the illustrated placeholder.
   ========================================================================== */

export const links = {
  email: "dee.vag78@gmail.com",
  // Paste your LinkedIn URL to show the LinkedIn button at the summit.
  linkedin: "",
  // Public link to the full Astroverse case study (Figma prototype, Notion, PDF...).
  // Make sure the file is shared as "Anyone with the link can view".
  caseStudy: "https://www.figma.com/design/JLcmPoJwck4eSBssOqh6Dh/Astroverse?node-id=4862-12685",
};

/* Astroverse 2.0: the four switchbacks (problems) */
export const legs = [
  {
    title: "People left before they saw a single profile",
    problem: "In 1.0, face liveness, KYC and a Kundli animation screen all came before the first profile, and most drop-off happened at those steps.",
    insight: "Trust matters at the moment of contact, not at the door. People verify once there is someone worth verifying for.",
    did: "Moved verification out of onboarding. Asked for it after 3 likes or comments, and locked chat until both people are verified.",
    result: "~88% of people who start onboarding finish their Kundli profile, and 6,100+ users are face-verified.",
    screens: [
      { label: "Profile · Get verified", src: "" },
      { label: "Nudge after 3 likes", src: "" },
    ],
  },
  {
    title: "Endless swiping, almost no matches",
    problem: "Unlimited feed. Users disliked 3.4 profiles for every one they liked, so every profile felt disposable.",
    insight: "Most matches came from people who had already liked you. A short, high-compatibility list respects everyone's time.",
    did: "3 handpicked profiles a day (8 on Pro), ranked by Guna score and preferences. People who already liked you get an “Already into you” tag.",
    result: "Likes rose from 23% to 38% of Discover decisions, and about 4 in 5 active users open Top Picks.",
    screens: [
      { label: "Quality, not quantity", src: "" },
      { label: "Today's picks", src: "" },
    ],
  },
  {
    title: "A Kundli score nobody could read",
    problem: "Every profile showed “23/36” and 8 Sanskrit terms. Most people stopped reading after the 2nd row.",
    insight: "People trust astrology when it explains them, not when it grades them, and their own deal-breakers still matter.",
    did: "Wrote a plain-language line for each Guna, made the chart tappable, and added a Preference Compatibility % next to the score.",
    result: "About as many people open the Kundli tab each month as open Home. Preference match now ranks Pro Discover.",
    screens: [
      { label: "Guna in plain words", src: "" },
      { label: "89% preference match", src: "" },
    ],
  },
  {
    title: "Nothing to do after today's picks",
    problem: "Limiting Discover left empty days. Once today's profiles were gone, people had no reason to stay.",
    insight: "If you limit the core loop, give people a second reason to open the app, ideally one that pays for itself.",
    did: "Designed Veda, an AI astrologer that answers from the user's own Kundli. Love-life chat is free, other topics are paid. Ran a pricing A/B test on time vs questions.",
    result: "2,200+ users asked Veda 11K+ questions in its first 3 months.",
    screens: [
      { label: "Ask Veda", src: "" },
      { label: "Chat with paid topics", src: "" },
    ],
  },
];

/* Fridge door magnets. These are PLACEHOLDERS: replace with your own places,
   the local you met, and what they told you. shape: "round" | "rect" | "tri" */
export const places = [
  { name: "Kedarkantha", state: "Uttarakhand", kind: "Trek",      color: "#2F6E8F", shape: "tri",   photo: "", local: "“Start before 4 am. The summit is yours at sunrise.”",            note: "Placeholder: swap in your own trek, the local you met, and what they told you." },
  { name: "Hampi",       state: "Karnataka",   kind: "Ruins",     color: "#C2562E", shape: "round", photo: "", local: "“Cross the river by coracle for the quieter side.”",               note: "Placeholder story: replace with your own." },
  { name: "Spiti",       state: "Himachal",    kind: "Road trip", color: "#6A4C93", shape: "rect",  photo: "", local: "“Eat at a homestay, not a café.”",                                 note: "Placeholder story: replace with your own." },
  { name: "Rishikesh",   state: "Uttarakhand", kind: "River",     color: "#1F8A70", shape: "round", photo: "", local: "“The evening aarti at Triveni Ghat is the one locals go to.”",     note: "Placeholder story: replace with your own." },
  { name: "Jaisalmer",   state: "Rajasthan",   kind: "Desert",    color: "#D08B1F", shape: "rect",  photo: "", local: "“Skip the camel safari crowds. Ask for Khuri village.”",          note: "Placeholder story: replace with your own." },
  { name: "Coorg",       state: "Karnataka",   kind: "Coffee",    color: "#5B7F2A", shape: "tri",   photo: "", local: "“Buy coffee from the estate, not the highway shop.”",             note: "Placeholder story: replace with your own." },
  { name: "Tawang",      state: "Arunachal",   kind: "Monastery", color: "#9C2F4A", shape: "rect",  photo: "", local: "“Carry your permit copy, always.”",                                note: "Placeholder story: replace with your own." },
  { name: "Gokarna",     state: "Karnataka",   kind: "Coast",     color: "#2A7A9C", shape: "round", photo: "", local: "“Walk the beach trail from Kudle to Paradise.”",                   note: "Placeholder story: replace with your own." },
];
