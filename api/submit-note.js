const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const COLORS = ['sticky-pink', 'sticky-gold', 'sticky-lavender', 'sticky-blue', 'sticky-green', 'sticky-mint'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { author, text, section } = req.body || {};

  if (!author?.trim() || !text?.trim()) {
    res.status(400).json({ error: 'Author and text are required' });
    return;
  }

  const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
  const rotate  = parseFloat((Math.random() * 8 - 4).toFixed(1));
  const today   = new Date().toISOString().split('T')[0];
  const now     = new Date();
  const dateDisplay = `${MONTHS[now.getMonth()]} ${now.getDate()}`;

  try {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_NOTES },
      properties: {
        Author:  { title:     [{ text: { content: author.slice(0, 30) } }] },
        Text:    { rich_text: [{ text: { content: text.slice(0, 150) } }] },
        Color:   { select:    { name: color } },
        Rotate:  { number:    rotate },
        Date:    { date:      { start: today } },
        Section:  { select:    { name: section || 'General' } },
        Approved: { checkbox:  false },
      },
    });

    res.status(200).json({ ok: true, dateDisplay, color, rotate });
  } catch (err) {
    console.error('[submit-note.js] Error:', err.message);
    res.status(500).json({ error: 'Failed to save note' });
  }
};
