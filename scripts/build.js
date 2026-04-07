/**
 * build.js — Transforms index.html.html into a Notion-powered index.html
 * Run: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'index.html.html');
const dest = path.join(__dirname, '..', 'index.html');

let html = fs.readFileSync(src, 'utf8');

// ── 1. Remove the hardcoded data declarations ─────────────────────────────────
// Match everything from the first data const to the end of corkboardNotes array,
// right before the blank line + "// Star pattern" comment.
html = html.replace(
  /const spotlightProjects=\[[\s\S]*?const corkboardNotes=\[[\s\S]*?\];\n/,
  ''
);

// ── 2. Remove the hardcoded typing animation IIFE ────────────────────────────
html = html.replace(
  /\/\/ Typing\n\(function\(\)\{const t=\["Dreamer[\s\S]*?800\)\}\)\(\);\n/,
  ''
);

// ── 3. Remove hardcoded fun facts IIFE ───────────────────────────────────────
html = html.replace(
  /\/\/ Fun facts rotation\n\(function\(\)\{const facts=\[[\s\S]*?\]\}\)\(\);\n/,
  ''
);

// ── 4. Remove hardcoded contact quotes IIFE ──────────────────────────────────
html = html.replace(
  /\/\/ Rotating contact quotes\n\(function\(\)\{const quotes=\[[\s\S]*?\}\)\(\);\n/,
  ''
);

// ── 5. Inject async IIFE wrapper — opens just before "// Spotlight" ──────────
const ASYNC_IIFE_OPEN = `// ── Notion CMS: load all content then render data-driven sections ──────────
(async function(){
const _r=await fetch('/api/content').catch(()=>null);
const _d=(_r&&_r.ok)?await _r.json():{};
const spotlightProjects=_d.spotlight||[];
const celebrations=_d.celebrations||[];
const experiences=_d.experiences||[];
const achievements=Object.assign({"All":[],"Personal":[],"Sports":[],"School":[],"Leadership":[],"Projects":[]},_d.achievements||{});
const hobbies=_d.hobbies||[];
const books=_d.books||[];
const blogPosts=_d.blogPosts||[];
const corkboardNotes=_d.corkboardNotes||[];
const _cfg=_d.config||{};
const _taglines=((_cfg.hero||{}).taglines)||["Dreamer. Achiever. Explorer.","Building my story, one chapter at a time.","Welcome to my world."];
const _funFacts=((_cfg.about||{}).funFacts)||["Has visited 7 countries ✈️","Knows 3 languages 🗣️"];
const _quotes=((_cfg.contact||{}).quotes)||[{text:"Stars can't shine without darkness.",by:"— D.H. Sidebottom"}];

// Apply config to static DOM elements
if(_cfg.about){
  const ab=_cfg.about;
  if(ab.photoEmoji){const el=document.querySelector('.about-photo');if(el)el.textContent=ab.photoEmoji;}
  const tags=document.querySelectorAll('.stat-tag');
  if(ab.location&&tags[1])tags[1].innerHTML='<span class="label">Location</span> '+ab.location;
  if(ab.profession&&tags[2])tags[2].innerHTML='<span class="label">Profession</span> '+ab.profession;
  if(ab.liveStatus){const ls=document.querySelector('.live-status span');if(ls)ls.textContent='Currently: '+ab.liveStatus;}
}
if(_cfg.contact&&_cfg.contact.email){
  const el=document.querySelector('.contact-email');
  if(el){el.href='mailto:'+_cfg.contact.email;el.innerHTML='✉️ '+_cfg.contact.email;}
}

// Typing animation (Notion taglines)
(function(){const t=_taglines,e=document.getElementById('typed-text');let li=0,ci=0,dl=false;function tp(){const l=t[li];if(!dl){e.textContent=l.substring(0,ci+1);ci++;if(ci>=l.length){setTimeout(()=>{dl=true;tp()},2000);return}setTimeout(tp,60+Math.random()*40)}else{e.textContent=l.substring(0,ci);ci--;if(ci<0){dl=false;ci=0;li=(li+1)%t.length;setTimeout(tp,500);return}setTimeout(tp,30)}}setTimeout(tp,800)})();

// Fun facts (Notion config)
if(_funFacts.length)document.getElementById('fun-fact').textContent=_funFacts[Math.floor(Math.random()*_funFacts.length)];

// Contact quotes (Notion config)
(function(){const q=_quotes[Math.floor(Math.random()*_quotes.length)];document.getElementById('contact-quote-text').textContent='"'+q.text+'"';document.getElementById('contact-quote-attr').textContent=q.by;})();

`;

html = html.replace('// Spotlight', ASYNC_IIFE_OPEN + '// Spotlight');

// ── 6. Close the async IIFE — after the last renderCork() call ───────────────
// The corkboard section ends with "renderCork();\n})();" — we insert the close after it.
html = html.replace(
  /renderCork\(\);\n\}\)\(\);\n\n\/\/ Modal/,
  'renderCork();\n})();\n\n})(); // end Notion CMS async IIFE\n\n// Modal'
);

// ── 7. Modify the "Leave a Note" submit handler to call /api/submit-note ─────
html = html.replace(
  `submitBtn.addEventListener('click',()=>{
if(nameEl.value.trim()&&msgEl.value.trim()){
formView.style.display='none';successView.style.display='block';
// Phase 2: send to CMS here
}});`,
  `submitBtn.addEventListener('click',async ()=>{
if(nameEl.value.trim()&&msgEl.value.trim()){
submitBtn.disabled=true;
try{await fetch('/api/submit-note',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:nameEl.value.trim(),text:msgEl.value.trim()+(selectedEmoji?' '+selectedEmoji:''),section:'General'})});}catch(e){console.error('Note submit error:',e);}
formView.style.display='none';successView.style.display='block';}});`
);

// ── 8. Write output ───────────────────────────────────────────────────────────
fs.writeFileSync(dest, html, 'utf8');
console.log(`✅  index.html written (${Math.round(html.length/1024)}KB)`);

// Verify key patterns are present
const checks = [
  ['Notion CMS async IIFE open',  html.includes('end Notion CMS async IIFE')],
  ['Async IIFE data fetch',        html.includes("fetch('/api/content')")],
  ['Submit note API call',         html.includes("fetch('/api/submit-note')")],
  ['Typing uses _taglines',        html.includes('const t=_taglines')],
  ['Fun facts from config',        html.includes('_funFacts')],
  ['Contact quotes from config',   html.includes('_quotes')],
  ['No hardcoded spotlightProjects array', !html.includes('const spotlightProjects=[{')],
  ['No hardcoded corkboardNotes array',    !html.includes('const corkboardNotes=[')],
];

let allOk = true;
for (const [name, ok] of checks) {
  console.log(`  ${ok ? '✅' : '❌'}  ${name}`);
  if (!ok) allOk = false;
}

if (!allOk) {
  console.error('\n⚠️  Some checks failed. Review the output above.\n');
  process.exit(1);
} else {
  console.log('\n🎉  All checks passed. Deploy index.html to Vercel!\n');
}
