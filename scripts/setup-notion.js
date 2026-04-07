/**
 * Notion CMS Setup Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Run ONCE to create all 9 Notion databases and seed them with your current data.
 *
 * Prerequisites:
 *   1. npm install  (installs @notionhq/client)
 *   2. Create a Notion Integration at notion.so/my-integrations → copy the token
 *   3. Create a blank Notion page (e.g. "Website CMS"), share it with your
 *      integration (Share → Invite → your integration name)
 *   4. Copy that page's ID from its URL:
 *      notion.so/Your-Page-Title-<PAGE_ID>  (32-char hex string)
 *
 * Usage:
 *   NOTION_TOKEN=secret_xxx NOTION_PARENT_PAGE_ID=xxxxx node scripts/setup-notion.js
 *
 * After running: copy the printed env vars into Vercel → Project Settings → Environment Variables
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Client } = require('@notionhq/client');

const TOKEN   = process.env.NOTION_TOKEN;
const PARENT  = process.env.NOTION_PARENT_PAGE_ID;

if (!TOKEN || !PARENT) {
  console.error('❌  Set NOTION_TOKEN and NOTION_PARENT_PAGE_ID before running.');
  process.exit(1);
}

const notion = new Client({ auth: TOKEN });

// ── Helpers ─────────────────────────────────────────────────────────────────
const title      = () => ({ id: 'title', type: 'title',       title:        {} });
const richText   = ()  => ({ type: 'rich_text',  rich_text:   {} });
const number_    = ()  => ({ type: 'number',     number:      { format: 'number' } });
const checkbox_  = ()  => ({ type: 'checkbox',   checkbox:    {} });
const select_    = (options) => ({ type: 'select', select: { options: options.map(n => ({ name: n })) } });
const multiSel_  = (options) => ({ type: 'multi_select', multi_select: { options: options.map(n => ({ name: n })) } });
const date_      = ()  => ({ type: 'date',       date:        {} });

async function createDB(parentId, dbTitle, properties) {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentId },
    title:  [{ type: 'text', text: { content: dbTitle } }],
    properties,
  });
  console.log(`  ✅  Created: ${dbTitle} → ${db.id}`);
  return db.id;
}

async function addPage(dbId, properties) {
  await notion.pages.create({ parent: { database_id: dbId }, properties });
}

function rt(content)  { return [{ type: 'text', text: { content: String(content) } }]; }
function ti(content)  { return [{ type: 'text', text: { content: String(content) } }]; }

// ── Seed data (mirrors your current hardcoded data) ──────────────────────────

const CONFIG_ENTRIES = [
  { key: 'hero.taglines',      value: 'Dreamer. Achiever. Explorer.|Building my story, one chapter at a time.|Welcome to my world.' },
  { key: 'about.photoEmoji',   value: '👩‍🎓' },
  { key: 'about.location',     value: 'New York, USA' },
  { key: 'about.profession',   value: 'Student & Creator' },
  { key: 'about.liveStatus',   value: 'Exploring new design ideas' },
  { key: 'about.funFacts',     value: "Can solve a Rubik's cube in under 2 min 🧩|Has visited 7 countries (and counting) ✈️|Knows 3 languages 🗣️|Can do a 540° roundhouse kick 🥋|Once read 12 books in one month 📚|Makes a mean chai latte ☕|Can name every constellation visible in winter ⭐|Has a playlist for every mood 🎵|Still sleeps with a childhood stuffed animal 🧸|Can cook a full Indian dinner from scratch 🍛" },
  { key: 'contact.email',      value: 'arisha@example.com' },
  { key: 'contact.quotes',     value: JSON.stringify([
    { text: "The best way to predict the future is to create it.", by: "— Abraham Lincoln" },
    { text: "Be yourself; everyone else is already taken.", by: "— Oscar Wilde" },
    { text: "The only impossible journey is the one you never begin.", by: "— Tony Robbins" },
    { text: "In the middle of difficulty lies opportunity.", by: "— Albert Einstein" },
    { text: "Do what you can, with what you have, where you are.", by: "— Theodore Roosevelt" },
    { text: "Stars can't shine without darkness.", by: "— D.H. Sidebottom" },
    { text: "She believed she could, so she did.", by: "— R.S. Grey" },
    { text: "Life is either a daring adventure or nothing at all.", by: "— Helen Keller" },
    { text: "Turn your wounds into wisdom.", by: "— Oprah Winfrey" },
    { text: "Not all who wander are lost.", by: "— J.R.R. Tolkien" },
  ]) },
];

const SPOTLIGHT = [
  { title: "Untitled — My First Book", desc: "A coming-of-age memoir about finding your voice in a noisy world.", progress: 60, status: "writing",     color: "green",   order: 1 },
  { title: "Personal Website",          desc: "Building my digital home from scratch — you're looking at it!",   progress: 85, status: "in-progress", color: "blue",    order: 2 },
  { title: "Photography Portfolio",     desc: "Curating my best travel and street photography shots.",           progress: 30, status: "planning",    color: "lavender",order: 3 },
];

const CELEBRATIONS = [
  { title: "Birthday Bash 2024",    date: "2024-12-15", emoji: "🎂", desc: "An unforgettable celebration with friends and family. The theme was neon lights!",                         collage: "🎈,🎁,🎉,🕯️,🥳",           pinned: false },
  { title: "Graduation Day",        date: "2024-05-20", emoji: "🎓", desc: "Finally walked the stage! Years of hard work culminated in this beautiful moment.",                       collage: "📜,🎊,👨‍👩‍👧,🌸",             pinned: true  },
  { title: "Diwali Celebration",    date: "2023-11-12", emoji: "🪔", desc: "Lights, family, food, and so much joy. The rangoli turned out amazing this year.",                        collage: "✨,🎆,🍛,🕯️,🪷,🎇",         pinned: false },
  { title: "New Year's Eve Party",  date: "2023-12-31", emoji: "🎆", desc: "Rang in the new year with the best crew. Countdown on the rooftop was magical.",                         collage: "🥂,🎶,🌃,🎇",               pinned: false },
  { title: "Family Reunion",        date: "2024-07-04", emoji: "👨‍👩‍👧‍👦", desc: "Everyone came together after two years. The kids have grown so much!",                               collage: "🏠,🍕,🤗,📸,🌳",            pinned: false },
  { title: "First Day at New Job",  date: "2024-09-01", emoji: "💼", desc: "Nervous but excited. The team was so welcoming and the office view is incredible.",                      collage: "🏢,☕,💻",                  pinned: false },
  { title: "Holi Festival",         date: "2024-03-25", emoji: "🎨", desc: "Drenched in color from head to toe. Pure joy with the neighborhood crew.",                               collage: "🌈,💦,🎶,🤗",               pinned: false },
  { title: "Summer Road Trip",      date: "2023-07-22", emoji: "🚗", desc: "Three friends, one car, seven states. The GPS gave up somewhere in Tennessee.",                          collage: "🗺️,⛽,🌅,📸",              pinned: false },
  { title: "Science Fair Win",      date: "2023-04-15", emoji: "🏆", desc: "Our AI plant project took first place! Months of late nights finally paid off.",                         collage: "🔬,🌱,💻,🥇",              pinned: false },
  { title: "Friendsgiving",         date: "2024-11-23", emoji: "🦃", desc: "Cooked a full Thanksgiving dinner with friends. The turkey was actually perfect this time!",             collage: "🍂,🥧,🕯️,🤗",             pinned: false },
];

const EXPERIENCE = [
  { role: "Taekwondo Instructor", org: "NYC Youth Martial Arts Center", duration: "Jun 2024 – Present", current: true, category: "teaching", order: 1,
    preview: "Teaching kids aged 8–14 the fundamentals of Taekwondo, discipline, and self-confidence.",
    body: "<p>What started as helping out at my old dojo turned into a full teaching role. I now lead two classes a week for beginners — teaching forms, sparring basics, and most importantly, the mental discipline that martial arts instills.</p><p>Seeing a shy kid land their first proper kick and light up with pride is the most rewarding feeling. I've learned that teaching forces you to truly understand something at its core.</p>",
    skills: ["Leadership","Patience","Discipline","Youth Development","Communication"],
    images: "🥋,👊", quote: "Arisha has a natural gift for connecting with young students. She makes them believe in themselves.", quotedBy: "— Master Kim, Head Instructor" },
  { role: "Software Engineering Intern", org: "TechNova Solutions", duration: "May 2025 – Aug 2025", current: false, category: "work", order: 2,
    preview: "Built internal dashboard tools using React and Python during a summer internship.",
    body: "<p>Spent the summer embedded with the product team, building an internal analytics dashboard from scratch. I owned the frontend in React and wrote Python scripts for data processing pipelines.</p><p>The biggest lesson wasn't technical — it was learning to communicate across teams, give demos to stakeholders, and handle feedback gracefully. Shipped my dashboard to 40+ internal users by the end.</p>",
    skills: ["React","Python","Data Visualization","Agile","Teamwork"],
    images: "💻,📊", quote: "One of the most self-driven interns we've had. Arisha delivered production-quality work ahead of schedule.", quotedBy: "— Priya Mehta, Engineering Manager" },
  { role: "Volunteer Tutor", org: "Bright Futures NYC", duration: "Sep 2023 – May 2024", current: false, category: "volunteer", order: 3,
    preview: "Tutored underprivileged high school students in math and science weekly.",
    body: "<p>Every Saturday morning, I'd head to the community center to work with 10th graders preparing for their state exams. We focused on algebra, geometry, and basic physics.</p><p>One of my students went from failing to scoring in the 80th percentile. That moment reminded me why showing up consistently matters more than any grand gesture.</p>",
    skills: ["Teaching","Math","Physics","Mentoring","Community Service"],
    images: "📐,🎓", quote: "", quotedBy: "" },
  { role: "Freelance Photographer", org: "Self-employed", duration: "Jan 2024 – Present", current: true, category: "freelance", order: 4,
    preview: "Shooting portraits, events, and street photography for local clients.",
    body: "<p>What started as a hobby turned into a small side business. I've shot local events, graduation portraits, and even a small wedding. My style leans toward candid, natural-light photography.</p><p>Photography taught me to see beauty in the mundane — a stranger's laugh, golden hour hitting a fire escape, rain on cobblestones. Every shoot makes me a better observer of life.</p>",
    skills: ["Photography","Lightroom","Portrait","Event Coverage","Composition"],
    images: "📸,🌅", quote: "", quotedBy: "" },
  { role: "Google Digital Marketing Certificate", org: "Google / Coursera", duration: "Completed Dec 2024", current: false, category: "cert", order: 5,
    preview: "Completed Google's professional certificate in digital marketing and e-commerce.",
    body: "<p>A comprehensive program covering SEO, SEM, social media marketing, email campaigns, and analytics. I completed all 7 courses with hands-on projects.</p><p>The capstone project involved building a full marketing strategy for a fictional e-commerce brand, which I applied directly to promoting my photography work.</p>",
    skills: ["SEO","Google Analytics","Social Media Marketing","Email Marketing","E-commerce"],
    images: "📜,📈", quote: "", quotedBy: "" },
  { role: "Student Council President", org: "Westfield Academy", duration: "Aug 2023 – Jun 2024", current: false, category: "work", order: 6,
    preview: "Led student government initiatives for campus sustainability and mental health awareness.",
    body: "<p>Elected to lead a council of 12 representatives. Spearheaded two major campaigns: a campus-wide sustainability audit that reduced paper waste by 35%, and a mental health awareness week featuring guest speakers and peer support workshops.</p><p>The hardest part was learning to delegate and trust others. The most rewarding part was hearing students say they felt heard.</p>",
    skills: ["Leadership","Public Speaking","Project Management","Advocacy","Team Building"],
    images: "👑,🏫", quote: "Arisha led with empathy and conviction. She left a lasting impact on our school community.", quotedBy: "— Dr. Williams, Faculty Advisor" },
];

const ACHIEVEMENTS = [
  { icon: "🧘", title: "Completed 30-Day Meditation Challenge", desc: "Built a daily mindfulness practice from scratch.", date: "Jan 2024", category: "Personal" },
  { icon: "🍳", title: "Learned to Cook 10 International Dishes", desc: "From Thai curry to Italian risotto — kitchen confidence unlocked.", date: "Mar 2024", category: "Personal" },
  { icon: "🏊", title: "Won District Swimming Championship", desc: "Gold in 100m freestyle — months of 5am training paid off.", date: "Feb 2023", category: "Sports" },
  { icon: "🏃", title: "Completed First 10K Run", desc: "Crossed the finish line with a personal best time.", date: "Oct 2023", category: "Sports" },
  { icon: "📋", title: "Dean's List — Fall Semester", desc: "Top 5% of the class. Hard work meets consistency.", date: "Dec 2023", category: "School" },
  { icon: "🔬", title: "Science Fair First Place", desc: "AI-powered plant health monitoring project took the gold.", date: "Apr 2023", category: "School" },
  { icon: "👑", title: "Student Council President", desc: "Led initiatives for campus sustainability and mental health awareness.", date: "2023–2024", category: "Leadership" },
  { icon: "🌍", title: "Led Community Cleanup Drive", desc: "Organized 50+ volunteers to restore the local riverside park.", date: "Jun 2024", category: "Leadership" },
  { icon: "📖", title: "Writing My First Book", desc: "A coming-of-age memoir about finding your voice in a noisy world.", date: "2025–Present", category: "Projects" },
  { icon: "🌐", title: "Built Personal Website", desc: "Designed and developed this portfolio from scratch — you're looking at it!", date: "Feb 2026", category: "Projects" },
  { icon: "📸", title: "Photography Portfolio", desc: "Curating a collection of travel and street photography shots.", date: "2026–Present", category: "Projects" },
];

const HOBBIES = [
  { icon: "📚", title: "Reading",       desc: "Lost in fiction and philosophy.",              collage: "📖,🛋️,☕",           order: 1 },
  { icon: "🎨", title: "Painting",      desc: "Watercolors are my happy place.",              collage: "🖌️,🎨,🖼️,🌊",       order: 2 },
  { icon: "🏊", title: "Swimming",      desc: "Nothing beats the calm of water.",             collage: "🌊,🏊‍♀️,🏖️",         order: 3 },
  { icon: "🎵", title: "Music",         desc: "Guitar strings and rainy days.",               collage: "🎸,🎧,🎶",           order: 4 },
  { icon: "✈️", title: "Traveling",    desc: "Collecting stamps and stories.",               collage: "🗺️,🏔️,🌅,🛫,🗼",   order: 5 },
  { icon: "🍳", title: "Cooking",       desc: "Experimenting with global flavors.",           collage: "🥘,🍕,🍣,🌮",        order: 6 },
  { icon: "📸", title: "Photography",   desc: "Capturing moments, one click at a time.",     collage: "📷,🌄,🌃,🌸,🦋",     order: 7 },
  { icon: "💻", title: "Coding",        desc: "Building things that live on the internet.",  collage: "⌨️,🖥️,🚀",          order: 8 },
];

const BOOKS = [
  { title: "Atomic Habits",                         author: "James Clear",          stars: 5, review: "Life-changing. Simple ideas, powerful impact. Wish I'd read it sooner.",                      series: "",              favorite: true,  reading: false },
  { title: "The Alchemist",                          author: "Paulo Coelho",         stars: 4, review: "Beautifully written journey. A bit slow in the middle but the message stays with you.",        series: "",              favorite: false, reading: false },
  { title: "Educated",                               author: "Tara Westover",        stars: 5, review: "Raw and inspiring. Couldn't put it down.",                                                     series: "",              favorite: true,  reading: false },
  { title: "Sapiens",                                author: "Yuval Noah Harari",    stars: 4, review: "Mind-expanding perspective on humanity. Dense but worth it.",                                  series: "",              favorite: false, reading: false },
  { title: "The Subtle Art of Not Giving a F*ck",   author: "Mark Manson",          stars: 3, review: "Good core message but felt repetitive after halfway.",                                         series: "",              favorite: false, reading: false },
  { title: "Becoming",                               author: "Michelle Obama",       stars: 5, review: "Warm, honest, and deeply motivating. A must-read.",                                            series: "",              favorite: true,  reading: false },
  { title: "The Hunger Games",                       author: "Suzanne Collins",      stars: 5, review: "Gripping from page one. Couldn't stop reading.",                                              series: "The Hunger Games", favorite: true,  reading: false },
  { title: "Catching Fire",                          author: "Suzanne Collins",      stars: 4, review: "Great sequel. The arena was even more intense.",                                               series: "The Hunger Games", favorite: false, reading: false },
  { title: "Mockingjay",                             author: "Suzanne Collins",      stars: 3, review: "Solid ending but pacing felt rushed in places.",                                               series: "The Hunger Games", favorite: false, reading: false },
  { title: "The Fellowship of the Ring",             author: "J.R.R. Tolkien",      stars: 5, review: "Epic world-building. Tolkien is a master of language.",                                       series: "Lord of the Rings", favorite: true,  reading: false },
  { title: "The Two Towers",                         author: "J.R.R. Tolkien",      stars: 4, review: "The Helm's Deep sequence is breathtaking. Slower start though.",                              series: "Lord of the Rings", favorite: false, reading: false },
  { title: "Thinking, Fast and Slow",               author: "Daniel Kahneman",      stars: 4, review: "Fascinating look at how our minds work. Dense but rewarding.",                                series: "",              favorite: false, reading: true  },
];

const BLOG_POSTS = [
  { title: "A Walk Through Central Park",    date: "2026-02-20", text: "The snow was still melting but the sun was out. Found the perfect bench, read two chapters, and watched the world go by.",                                                                            emoji: "🌳", hasImage: true  },
  { title: "Late Night Coding Session",      date: "2026-02-10", text: "Finally cracked the bug that's been haunting me for three days. The 2am victory dance was worth every lost hour of sleep.",                                                                           emoji: "",   hasImage: false },
  { title: "First Chapter Done!",            date: "2026-01-28", text: "Submitted the first chapter of my book to my mentor. Terrifying and thrilling in equal measure. No turning back now.",                                                                                emoji: "📖", hasImage: true  },
  { title: "Cooking Disaster",               date: "2026-01-15", text: "Tried to make soufflé. What I got was a pancake with ambition. Still tasted great though.",                                                                                                           emoji: "🍳", hasImage: true  },
  { title: "New Year Reflections",           date: "2025-12-31", text: "Standing on the rooftop at midnight, watching fireworks paint the sky. This year taught me that growth isn't always comfortable, but it's always worth it.",                                         emoji: "🎆", hasImage: true  },
  { title: "The Art Gallery That Changed Me",date: "2025-11-15", text: "Walked into a small gallery in Chelsea on a whim. Left three hours later with a completely new perspective on color and emotion. Art really does heal.",                                             emoji: "🎨", hasImage: true  },
  { title: "My First Open Mic Night",        date: "2025-10-08", text: "My hands were shaking, my voice cracked on the second verse, and I forgot half the lyrics. But the applause at the end? Worth every terrifying second.",                                             emoji: "🎤", hasImage: false },
  { title: "Summer Road Trip Memories",      date: "2025-07-22", text: "Three friends, one car, seven states, and about a hundred wrong turns. The GPS gave up somewhere in Tennessee. Best week of my life.",                                                                emoji: "🚗", hasImage: true  },
];

const NOTES = [
  { author: "Sarah",        text: "The birthday party was INSANE! Best night ever 🎉",                        color: "sticky-pink",    rotate: -3, date: "2026-02-15", section: "Celebrations" },
  { author: "Raj",          text: "That Diwali celebration was magical ✨",                                    color: "sticky-gold",    rotate:  2, date: "2025-11-12", section: "Celebrations" },
  { author: "Mom",          text: "So proud of my student council president! 👑",                              color: "sticky-lavender",rotate: -2, date: "2026-01-20", section: "Achievements" },
  { author: "Coach Dave",   text: "That swimming medal was well deserved 🏊",                                  color: "sticky-blue",    rotate:  4, date: "2023-02-25", section: "Achievements" },
  { author: "Lily",         text: "Your watercolors keep getting better!! 🎨",                                 color: "sticky-green",   rotate: -1, date: "2026-01-05", section: "Hobbies"       },
  { author: "Jake",         text: "You got me hooked on Atomic Habits, thanks! 📚",                            color: "sticky-mint",    rotate:  3, date: "2025-12-10", section: "Books"         },
  { author: "Priya",        text: "This website is gorgeous, Arisha! 💛",                                      color: "sticky-gold",    rotate: -4, date: "2026-02-20", section: "General"       },
  { author: "Uncle Vikram", text: "Keep shining, beta! The world is yours 🌟",                                 color: "sticky-blue",    rotate:  2, date: "2026-02-01", section: "General"       },
  { author: "Nina",         text: "Can't wait to read your book!! 📖",                                         color: "sticky-pink",    rotate: -2, date: "2026-01-30", section: "General"       },
  { author: "Ava",          text: "You inspire me every day ❤️",                                              color: "sticky-lavender",rotate:  3, date: "2026-02-18", section: "General"       },
  { author: "Dad",          text: "Your cooking has gotten so good! That biryani was perfect 🍛",              color: "sticky-green",   rotate: -3, date: "2026-01-12", section: "Hobbies"       },
  { author: "Emma",         text: "The graduation speech brought tears to my eyes 😭",                          color: "sticky-pink",    rotate:  1, date: "2024-05-21", section: "Celebrations" },
  { author: "Arjun",        text: "Can't believe you ran a 10K! You're a beast 💪",                            color: "sticky-blue",    rotate: -2, date: "2023-10-10", section: "Achievements" },
  { author: "Sophie",       text: "Road trip was the best week ever!! 🚗",                                     color: "sticky-mint",    rotate:  4, date: "2025-07-25", section: "General"       },
  { author: "Grandma",      text: "My beautiful granddaughter, always reaching for the stars 🌙",               color: "sticky-lavender",rotate: -1, date: "2025-12-25", section: "General"       },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  Starting Notion CMS setup...\n');

  const ids = {};

  // 1. Site Config
  console.log('📋  Creating Site Config database...');
  ids.config = await createDB(PARENT, '⚙️ Site Config', {
    Key:   { name: 'Key',   ...title() },
    Value: { name: 'Value', ...richText() },
  });
  for (const e of CONFIG_ENTRIES) {
    await addPage(ids.config, {
      Key:   { title:     ti(e.key)   },
      Value: { rich_text: rt(e.value) },
    });
  }
  console.log(`    Seeded ${CONFIG_ENTRIES.length} config entries`);

  // 2. Spotlight
  console.log('\n🔦  Creating Spotlight database...');
  ids.spotlight = await createDB(PARENT, '🔦 Spotlight', {
    Title:       { name: 'Title',       ...title()  },
    Description: { name: 'Description', ...richText() },
    Progress:    { name: 'Progress',    ...number_()  },
    Status:      { name: 'Status',      ...select_(['writing','in-progress','planning']) },
    Color:       { name: 'Color',       ...select_(['green','blue','lavender']) },
    Order:       { name: 'Order',       ...number_() },
  });
  for (const s of SPOTLIGHT) {
    await addPage(ids.spotlight, {
      Title:       { title:     ti(s.title)    },
      Description: { rich_text: rt(s.desc)     },
      Progress:    { number:    s.progress     },
      Status:      { select:    { name: s.status } },
      Color:       { select:    { name: s.color  } },
      Order:       { number:    s.order        },
    });
  }
  console.log(`    Seeded ${SPOTLIGHT.length} spotlight cards`);

  // 3. Celebrations
  console.log('\n🎉  Creating Celebrations database...');
  ids.celebrations = await createDB(PARENT, '🎉 Celebrations', {
    Title:         { name: 'Title',         ...title()     },
    Date:          { name: 'Date',          ...date_()     },
    Emoji:         { name: 'Emoji',         ...richText()  },
    Description:   { name: 'Description',   ...richText()  },
    CollageEmojis: { name: 'CollageEmojis', ...richText()  },
    Pinned:        { name: 'Pinned',        ...checkbox_() },
  });
  for (const c of CELEBRATIONS) {
    await addPage(ids.celebrations, {
      Title:         { title:     ti(c.title)   },
      Date:          { date:      { start: c.date } },
      Emoji:         { rich_text: rt(c.emoji)   },
      Description:   { rich_text: rt(c.desc)    },
      CollageEmojis: { rich_text: rt(c.collage) },
      Pinned:        { checkbox:  c.pinned      },
    });
  }
  console.log(`    Seeded ${CELEBRATIONS.length} celebrations`);

  // 4. Experience
  console.log('\n💼  Creating Experience database...');
  ids.experience = await createDB(PARENT, '💼 Experience', {
    Role:         { name: 'Role',         ...title()     },
    Organization: { name: 'Organization', ...richText()  },
    Duration:     { name: 'Duration',     ...richText()  },
    Current:      { name: 'Current',      ...checkbox_() },
    Category:     { name: 'Category',     ...select_(['work','teaching','volunteer','freelance','cert']) },
    Preview:      { name: 'Preview',      ...richText()  },
    Body:         { name: 'Body',         ...richText()  },
    Skills:       { name: 'Skills',       ...multiSel_(['Leadership','Patience','Discipline','Youth Development','Communication','React','Python','Data Visualization','Agile','Teamwork','Teaching','Math','Physics','Mentoring','Community Service','Photography','Lightroom','Portrait','Event Coverage','Composition','SEO','Google Analytics','Social Media Marketing','Email Marketing','E-commerce','Public Speaking','Project Management','Advocacy','Team Building']) },
    Images:       { name: 'Images',       ...richText()  },
    Quote:        { name: 'Quote',        ...richText()  },
    QuotedBy:     { name: 'QuotedBy',     ...richText()  },
    Order:        { name: 'Order',        ...number_()   },
  });
  for (const e of EXPERIENCE) {
    await addPage(ids.experience, {
      Role:         { title:        ti(e.role)      },
      Organization: { rich_text:    rt(e.org)       },
      Duration:     { rich_text:    rt(e.duration)  },
      Current:      { checkbox:     e.current       },
      Category:     { select:       { name: e.category } },
      Preview:      { rich_text:    rt(e.preview)   },
      Body:         { rich_text:    rt(e.body)      },
      Skills:       { multi_select: e.skills.map(s => ({ name: s })) },
      Images:       { rich_text:    rt(e.images)    },
      Quote:        { rich_text:    rt(e.quote)     },
      QuotedBy:     { rich_text:    rt(e.quotedBy)  },
      Order:        { number:       e.order         },
    });
  }
  console.log(`    Seeded ${EXPERIENCE.length} experience entries`);

  // 5. Achievements
  console.log('\n🏆  Creating Achievements database...');
  ids.achievements = await createDB(PARENT, '🏆 Achievements', {
    Title:    { name: 'Title',    ...title()    },
    Icon:     { name: 'Icon',     ...richText() },
    Description: { name: 'Description', ...richText() },
    Date:     { name: 'Date',     ...richText() },
    Category: { name: 'Category', ...select_(['Personal','Sports','School','Leadership','Projects']) },
  });
  for (const a of ACHIEVEMENTS) {
    await addPage(ids.achievements, {
      Title:       { title:     ti(a.title) },
      Icon:        { rich_text: rt(a.icon)  },
      Description: { rich_text: rt(a.desc)  },
      Date:        { rich_text: rt(a.date)  },
      Category:    { select:    { name: a.category } },
    });
  }
  console.log(`    Seeded ${ACHIEVEMENTS.length} achievements`);

  // 6. Hobbies
  console.log('\n🎨  Creating Hobbies database...');
  ids.hobbies = await createDB(PARENT, '🎨 Hobbies', {
    Title:        { name: 'Title',        ...title()    },
    Icon:         { name: 'Icon',         ...richText() },
    Description:  { name: 'Description',  ...richText() },
    CollageEmojis:{ name: 'CollageEmojis',...richText() },
    Order:        { name: 'Order',        ...number_()  },
  });
  for (const h of HOBBIES) {
    await addPage(ids.hobbies, {
      Title:         { title:     ti(h.title)   },
      Icon:          { rich_text: rt(h.icon)    },
      Description:   { rich_text: rt(h.desc)    },
      CollageEmojis: { rich_text: rt(h.collage) },
      Order:         { number:    h.order       },
    });
  }
  console.log(`    Seeded ${HOBBIES.length} hobbies`);

  // 7. Books
  console.log('\n📚  Creating Books database...');
  ids.books = await createDB(PARENT, '📚 Books', {
    Title:    { name: 'Title',    ...title()     },
    Author:   { name: 'Author',   ...richText()  },
    Stars:    { name: 'Stars',    ...number_()   },
    Review:   { name: 'Review',   ...richText()  },
    Series:   { name: 'Series',   ...richText()  },
    Favorite: { name: 'Favorite', ...checkbox_() },
    Reading:  { name: 'Reading',  ...checkbox_() },
  });
  for (const b of BOOKS) {
    await addPage(ids.books, {
      Title:    { title:     ti(b.title)   },
      Author:   { rich_text: rt(b.author)  },
      Stars:    { number:    b.stars       },
      Review:   { rich_text: rt(b.review)  },
      Series:   { rich_text: rt(b.series)  },
      Favorite: { checkbox:  b.favorite    },
      Reading:  { checkbox:  b.reading     },
    });
  }
  console.log(`    Seeded ${BOOKS.length} books`);

  // 8. Blog Posts
  console.log('\n✍️   Creating Blog database...');
  ids.blog = await createDB(PARENT, '✍️ Blog Posts', {
    Title:    { name: 'Title',    ...title()     },
    Date:     { name: 'Date',     ...date_()     },
    Text:     { name: 'Text',     ...richText()  },
    Emoji:    { name: 'Emoji',    ...richText()  },
    HasImage: { name: 'HasImage', ...checkbox_() },
  });
  for (const b of BLOG_POSTS) {
    await addPage(ids.blog, {
      Title:    { title:     ti(b.title)    },
      Date:     { date:      { start: b.date } },
      Text:     { rich_text: rt(b.text)     },
      Emoji:    { rich_text: rt(b.emoji)    },
      HasImage: { checkbox:  b.hasImage     },
    });
  }
  console.log(`    Seeded ${BLOG_POSTS.length} blog posts`);

  // 9. Hype Squad Notes
  console.log('\n📌  Creating Hype Squad Notes database...');
  ids.notes = await createDB(PARENT, '📌 Hype Squad Notes', {
    Author:  { name: 'Author',  ...title()    },
    Text:    { name: 'Text',    ...richText() },
    Color:   { name: 'Color',   ...select_(['sticky-pink','sticky-gold','sticky-lavender','sticky-blue','sticky-green','sticky-mint']) },
    Rotate:  { name: 'Rotate',  ...number_()  },
    Date:    { name: 'Date',    ...date_()    },
    Section: { name: 'Section', ...select_(['General','Celebrations','Achievements','Hobbies','Books']) },
  });
  for (const n of NOTES) {
    await addPage(ids.notes, {
      Author:  { title:     ti(n.author)  },
      Text:    { rich_text: rt(n.text)    },
      Color:   { select:    { name: n.color   } },
      Rotate:  { number:    n.rotate      },
      Date:    { date:      { start: n.date } },
      Section: { select:    { name: n.section } },
    });
  }
  console.log(`    Seeded ${NOTES.length} notes`);

  // ── Print results ──────────────────────────────────────────────────────────
  console.log('\n✅  All done! Add these to Vercel Environment Variables:\n');
  console.log(`NOTION_TOKEN=${TOKEN}`);
  console.log(`NOTION_DB_CONFIG=${ids.config}`);
  console.log(`NOTION_DB_SPOTLIGHT=${ids.spotlight}`);
  console.log(`NOTION_DB_CELEBRATIONS=${ids.celebrations}`);
  console.log(`NOTION_DB_EXPERIENCE=${ids.experience}`);
  console.log(`NOTION_DB_ACHIEVEMENTS=${ids.achievements}`);
  console.log(`NOTION_DB_HOBBIES=${ids.hobbies}`);
  console.log(`NOTION_DB_BOOKS=${ids.books}`);
  console.log(`NOTION_DB_BLOG=${ids.blog}`);
  console.log(`NOTION_DB_NOTES=${ids.notes}`);
  console.log('\n🎉  Your Notion CMS is ready! Edit content at notion.so and it will appear on your site within 5 minutes.\n');
}

main().catch(err => {
  console.error('\n❌  Setup failed:', err.message);
  process.exit(1);
});
