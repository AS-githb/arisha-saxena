const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ── Property extractors ──────────────────────────────────────────────────────
function text(props, key) {
  const p = props[key];
  if (!p) return '';
  if (p.title) return p.title.map(t => t.plain_text).join('');
  if (p.rich_text) return p.rich_text.map(t => t.plain_text).join('');
  return '';
}
function num(props, key) { return props[key]?.number ?? null; }
function bool(props, key) { return props[key]?.checkbox ?? false; }
function sel(props, key) { return props[key]?.select?.name ?? null; }
function multiSel(props, key) { return (props[key]?.multi_select ?? []).map(s => s.name); }
function date(props, key) { return props[key]?.date?.start ?? null; }

// ── Query entire database (handles Notion's 100-row page limit) ──────────────
async function query(dbId) {
  if (!dbId) return [];
  const pages = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: dbId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return pages;
}

// ── Format date display ──────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
function fmtDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

// ── Main handler ─────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Cache 5 min at CDN; serve stale for up to 1 min while revalidating
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  try {
    const [
      configPages,
      spotlightPages,
      celebPages,
      expPages,
      achPages,
      hobbyPages,
      bookPages,
      blogPages,
      notePages,
      seriesPages,
    ] = await Promise.all([
      query(process.env.NOTION_DB_CONFIG),
      query(process.env.NOTION_DB_SPOTLIGHT),
      query(process.env.NOTION_DB_CELEBRATIONS),
      query(process.env.NOTION_DB_EXPERIENCE),
      query(process.env.NOTION_DB_ACHIEVEMENTS),
      query(process.env.NOTION_DB_HOBBIES),
      query(process.env.NOTION_DB_BOOKS),
      query(process.env.NOTION_DB_BLOG),
      query(process.env.NOTION_DB_NOTES),
      query(process.env.NOTION_DB_SERIES),
    ]);

    // ── Config (key-value store) ───────────────────────────────────────────
    const raw = {};
    for (const p of configPages) {
      raw[text(p.properties, 'Key')] = text(p.properties, 'Value');
    }

    const config = {
      hero: {
        taglines: (raw['hero.taglines'] || 'Welcome to my world.').split('|').map(s => s.trim()).filter(Boolean),
      },
      about: {
        photoUrl:    raw['about.photoUrl']    || '',
        photoEmoji:  raw['about.photoEmoji']  || '👩‍🎓',
        location:    raw['about.location']    || 'New York, USA',
        profession:  raw['about.profession']  || 'Student & Creator',
        liveStatus:  raw['about.liveStatus']  || 'Exploring new ideas',
        funFacts:    (raw['about.funFacts'] || '').split('|').map(s => s.trim()).filter(Boolean),
      },
      contact: {
        name:     raw['contact.name']     || 'Arisha Saxena',
        email:    raw['contact.email']    || '',
        linkedin: raw['contact.linkedin'] || '',
        resume:   raw['contact.resume']   || '',
        phone:    raw['contact.phone']    || '',
        quotes: (() => {
          try { return JSON.parse(raw['contact.quotes'] || '[]'); }
          catch { return [{ text: "Stars can't shine without darkness.", by: '— D.H. Sidebottom' }]; }
        })(),
      },
      footer: {
        text: raw['footer.text'] || 'Arisha Saxena - Built with Passion',
      },
    };

    // ── Spotlight ──────────────────────────────────────────────────────────
    const spotlight = spotlightPages
      .sort((a, b) => (num(a.properties, 'Order') || 0) - (num(b.properties, 'Order') || 0))
      .map(p => ({
        title:    text(p.properties, 'Title'),
        desc:     text(p.properties, 'Description'),
        progress: num(p.properties, 'Progress') || 0,
        status:   sel(p.properties, 'Status')   || 'in-progress',
        barClass: sel(p.properties, 'Color')    || 'blue',
      }));

    // ── Celebrations ───────────────────────────────────────────────────────
    const celebrations = celebPages
      .sort((a, b) => {
        const da = date(a.properties, 'Date') || '';
        const db_ = date(b.properties, 'Date') || '';
        return db_.localeCompare(da);
      })
      .map(p => {
        const iso = date(p.properties, 'Date');
        const yr = iso ? new Date(iso).getUTCFullYear() : new Date().getFullYear();
        return {
          title:        text(p.properties, 'Title'),
          date:         iso || '',
          dateDisplay:  fmtDate(iso),
          year:         yr,
          emoji:        text(p.properties, 'Emoji'),
          desc:         text(p.properties, 'Description'),
          collageImages: text(p.properties, 'CollageImages').split(',').map(e => e.trim()).filter(Boolean),
          pinned:       bool(p.properties, 'Pinned'),
        };
      });

    // ── Experience ─────────────────────────────────────────────────────────
    const experiences = expPages
      .sort((a, b) => (num(a.properties, 'Order') || 0) - (num(b.properties, 'Order') || 0))
      .map(p => ({
        role:      text(p.properties, 'Role'),
        org:       text(p.properties, 'Organization'),
        duration:  text(p.properties, 'Duration'),
        current:   bool(p.properties, 'Current'),
        category:  sel(p.properties, 'Category') || 'work',
        preview:   text(p.properties, 'Preview'),
        body:      text(p.properties, 'Body'),
        skills:    multiSel(p.properties, 'Skills'),
        images:    text(p.properties, 'Images').split(',').map(e => e.trim()).filter(Boolean),
        quote:     text(p.properties, 'Quote')    || null,
        quotedBy:  text(p.properties, 'QuotedBy') || null,
      }));

    // ── Achievements ───────────────────────────────────────────────────────
    const achList = achPages.map(p => ({
      icon:     text(p.properties, 'Icon'),
      title:    text(p.properties, 'Title'),
      desc:     text(p.properties, 'Description'),
      date:     text(p.properties, 'Date'),
      category: sel(p.properties, 'Category') || 'Personal',
    }));
    const achievements = {
      All:        achList,
      Personal:   achList.filter(a => a.category === 'Personal'),
      Sports:     achList.filter(a => a.category === 'Sports'),
      School:     achList.filter(a => a.category === 'School'),
      Leadership: achList.filter(a => a.category === 'Leadership'),
      Projects:   achList.filter(a => a.category === 'Projects'),
    };

    // ── Hobbies ────────────────────────────────────────────────────────────
    const hobbies = hobbyPages
      .sort((a, b) => (num(a.properties, 'Order') || 0) - (num(b.properties, 'Order') || 0))
      .map(p => ({
        icon:         text(p.properties, 'Icon'),
        title:        text(p.properties, 'Title'),
        desc:         text(p.properties, 'Description'),
        collageImages: text(p.properties, 'CollageImages').split(',').map(e => e.trim()).filter(Boolean),
      }));

    // ── Books ──────────────────────────────────────────────────────────────
    const books = bookPages.map(p => ({
      title:    text(p.properties, 'Title'),
      author:   text(p.properties, 'Author'),
      stars:    num(p.properties, 'Stars') || 3,
      review:   text(p.properties, 'Review'),
      series:   text(p.properties, 'Series') || null,
      favorite: bool(p.properties, 'Favorite'),
      reading:  bool(p.properties, 'Reading'),
      order:    num(p.properties, 'Order') ?? 999,
    }));

    // ── Blog posts ─────────────────────────────────────────────────────────
    const blogPosts = blogPages
      .sort((a, b) => {
        const da = date(a.properties, 'Date') || '';
        const db_ = date(b.properties, 'Date') || '';
        return db_.localeCompare(da);
      })
      .map(p => {
        const iso = date(p.properties, 'Date');
        return {
          title:       text(p.properties, 'Title'),
          date:        iso || '',
          dateDisplay: fmtDate(iso),
          text:        text(p.properties, 'Text'),
          emoji:       text(p.properties, 'Emoji') || null,
          hasImage:    bool(p.properties, 'HasImage'),
          collageImages: text(p.properties, 'CollageImages').split(',').map(e => e.trim()).filter(Boolean),
        };
      });

    // ── Hype Squad Notes ───────────────────────────────────────────────────
    const corkboardNotes = notePages
      .filter(p => bool(p.properties, 'Approved'))
      .sort((a, b) => {
        const da = date(a.properties, 'Date') || '';
        const db_ = date(b.properties, 'Date') || '';
        return db_.localeCompare(da);
      })
      .map(p => {
        const iso = date(p.properties, 'Date');
        return {
          author:      text(p.properties, 'Author'),
          text:        text(p.properties, 'Text'),
          color:       sel(p.properties, 'Color')   || 'sticky-gold',
          rotate:      num(p.properties, 'Rotate')  || 0,
          date:        iso || '',
          dateDisplay: fmtDateShort(iso),
          section:     sel(p.properties, 'Section') || 'general',
          pinned:      bool(p.properties, 'PinToSection'),
        };
      });

    // ── Book Series ────────────────────────────────────────────────────────
    const bookSeries = seriesPages
      .sort((a, b) => (num(a.properties, 'Order') || 0) - (num(b.properties, 'Order') || 0))
      .map(p => ({
        name:   text(p.properties, 'Name'),
        review: text(p.properties, 'Review'),
      }));

    res.json({ config, spotlight, celebrations, experiences, achievements, hobbies, books, blogPosts, corkboardNotes, bookSeries });

  } catch (err) {
    console.error('[content.js] Error:', err.message);
    res.status(500).json({ error: 'Failed to load content', message: err.message });
  }
};
