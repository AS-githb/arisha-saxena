
// ═══ URL VALIDATION (global scope) ═══
function isValidImageUrl(url){if(!url||typeof url!=='string')return false;try{const u=new URL(url);return(u.protocol==='http:'||u.protocol==='https:')&&url.length<2048}catch{return false}}
function setImageSrcSafe(img,url,fb){if(isValidImageUrl(url)){img.src=url}else if(fb){fb()}else{img.style.display='none'}}

// ═══ STAR PATTERN (immediate) ═══
(function(){const c=document.getElementById('star-pattern'),x=c.getContext('2d');function r(){c.width=window.innerWidth;c.height=document.body.scrollHeight||window.innerHeight*8;d()}function d(){x.clearRect(0,0,c.width,c.height);const n=Math.floor((c.width*c.height)/8000);for(let i=0;i<n;i++){x.beginPath();x.arc(Math.random()*c.width,Math.random()*c.height,Math.random()*1.2+0.3,0,Math.PI*2);x.fillStyle=`rgba(200,210,240,${Math.random()*0.5+0.1})`;x.fill()}}r();window.addEventListener('resize',r);new MutationObserver(r).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})})();

// ═══ PARTICLES (immediate) ═══
(function(){const c=document.getElementById('particles-canvas'),x=c.getContext('2d');let p=[];const co=['rgba(65,105,225,0.6)','rgba(212,160,32,0.5)','rgba(181,126,220,0.4)','rgba(80,200,120,0.3)'];function rs(){c.width=window.innerWidth;c.height=window.innerHeight}function cr(){p=[];for(let i=0;i<Math.min(80,Math.floor(c.width/15));i++)p.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+0.5,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,color:co[Math.floor(Math.random()*co.length)]})}function d(){x.clearRect(0,0,c.width,c.height);p.forEach(pt=>{pt.x+=pt.vx;pt.y+=pt.vy;if(pt.x<0)pt.x=c.width;if(pt.x>c.width)pt.x=0;if(pt.y<0)pt.y=c.height;if(pt.y>c.height)pt.y=0;x.beginPath();x.arc(pt.x,pt.y,pt.r,0,Math.PI*2);x.fillStyle=pt.color;x.fill()});requestAnimationFrame(d)}rs();cr();d();window.addEventListener('resize',()=>{rs();cr()})})();

// ═══ HERO STARS (immediate) ═══
(function(){const c=document.getElementById('hero-stars'),ch=['✦','✧','⋆','✦','✧'],ps=[{x:5,y:20},{x:12,y:55},{x:18,y:30},{x:25,y:70},{x:35,y:15},{x:42,y:50},{x:50,y:80},{x:58,y:25},{x:65,y:60},{x:72,y:18},{x:78,y:45},{x:85,y:70},{x:92,y:35},{x:95,y:55}];ps.forEach((p,i)=>{const s=document.createElement('span');s.className='hero-star';s.textContent=ch[i%ch.length];s.style.left=p.x+'%';s.style.top=p.y+'%';s.style.fontSize=(0.7+Math.random()*1.2)+'rem';s.style.animationDelay=(Math.random()*4)+'s';s.style.animationDuration=(3+Math.random()*3)+'s';s.style.opacity=0.4+Math.random()*0.5;c.appendChild(s)})})();

// ═══ THEME TOGGLE ═══
document.getElementById('theme-toggle').addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark'});

// ═══ HAMBURGER ═══
document.getElementById('hamburger').addEventListener('click',function(){this.classList.toggle('active');document.getElementById('nav-links').classList.toggle('open')});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',function(e){
e.preventDefault();const href=this.getAttribute('href');
document.getElementById('hamburger').classList.remove('active');document.getElementById('nav-links').classList.remove('open');
setTimeout(()=>{const target=document.querySelector(href);if(target){const navH=document.querySelector('.navbar').offsetHeight;window.scrollTo({top:target.offsetTop-navH-10,behavior:'smooth'})}},100)}));

// ═══ SCROLL SPY ═══
(function(){const ss=document.querySelectorAll('section[id]'),ls=document.querySelectorAll('.nav-links a');function o(){const sy=window.scrollY+100;ss.forEach(s=>{const l=document.querySelector(`.nav-links a[href="#${s.id}"]`);if(l&&sy>=s.offsetTop&&sy<s.offsetTop+s.offsetHeight){ls.forEach(a=>a.classList.remove('active'));l.classList.add('active')}})}window.addEventListener('scroll',o,{passive:true});o()})();

// ═══ ANNOUNCEMENT BANNER ═══
function closeBanner(){document.getElementById('announcement-banner').classList.add('hidden');document.body.classList.remove('has-banner');sessionStorage.setItem('bannerDismissed','true')}
(function(){if(!sessionStorage.getItem('bannerDismissed')){document.body.classList.add('has-banner')}else{document.getElementById('announcement-banner').classList.add('hidden')}})();

// ═══ MODAL (global) ═══
function openModal(title,sub,desc,items){
const body=document.getElementById('modal-body');
let col='';
if(items&&items.length){col=items.map(item=>{
if(isValidImageUrl(item)){return '<div class="collage-item"><img class="img-collage" src="'+item+'" alt="" onerror="this.parentElement.innerHTML=\'<div class=\\\'placeholder-img\\\'>📷</div>\'"></div>'}
return '<div class="collage-item"><div class="placeholder-img">'+item+'</div></div>'}).join('')}
body.innerHTML='<h2 class="modal-title">'+title+'</h2>'+(sub?'<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">'+sub+'</p>':'')+'<p class="modal-description">'+desc+'</p>'+(col?'<div class="collage-grid">'+col+'</div>':'');
document.getElementById('modal-overlay').classList.add('active');document.body.style.overflow='hidden'}
function closeModal(){document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow=''}
document.getElementById('modal-close').addEventListener('click',closeModal);
document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeExpModal()}});

// ═══ EXPERIENCE MODAL (global) ═══
function closeExpModal(){document.getElementById('exp-modal-overlay').classList.remove('active');document.body.style.overflow=''}
document.getElementById('exp-modal-close').addEventListener('click',closeExpModal);
document.getElementById('exp-modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeExpModal()});

// ═══ FETCH DATA + RENDER ALL SECTIONS ═══
(async function(){
try{
const res=await fetch('/api/content');
const data=await res.json();
const{config,spotlight,celebrations,experiences,achievements,hobbies,books,blogPosts,corkboardNotes,bookSeries}=data;

// --- Typing effect ---
(function(){const t=config.hero.taglines.length?config.hero.taglines:["Welcome to my world."],e=document.getElementById('typed-text');let li=0,ci=0,dl=false;function tp(){const l=t[li];if(!dl){e.textContent=l.substring(0,ci+1);ci++;if(ci>=l.length){setTimeout(()=>{dl=true;tp()},2000);return}setTimeout(tp,60+Math.random()*40)}else{e.textContent=l.substring(0,ci);ci--;if(ci<0){dl=false;ci=0;li=(li+1)%t.length;setTimeout(tp,500);return}setTimeout(tp,30)}}setTimeout(tp,800)})();

// --- Fun facts ---
(function(){const facts=config.about.funFacts;if(facts.length){document.getElementById('fun-fact').textContent=facts[Math.floor(Math.random()*facts.length)]}})();

// --- About section ---
(function(){
const photoEl=document.getElementById('about-photo');
if(config.about.photoUrl&&isValidImageUrl(config.about.photoUrl)){
const img=document.createElement('img');img.className='img-about';img.alt='Arisha Saxena';
setImageSrcSafe(img,config.about.photoUrl,()=>{photoEl.textContent=config.about.photoEmoji||'👩‍🎓'});
img.onerror=()=>{photoEl.innerHTML=config.about.photoEmoji||'👩‍🎓'};
photoEl.innerHTML='';photoEl.appendChild(img)}
else{photoEl.textContent=config.about.photoEmoji||'👩‍🎓'}
if(config.about.location)document.getElementById('about-location').textContent=config.about.location;
if(config.about.profession)document.getElementById('about-profession').textContent=config.about.profession;
if(config.about.liveStatus)document.getElementById('about-live-status').textContent='Currently: '+config.about.liveStatus;
})();

// --- Contact ---
(function(){
const quotes=config.contact.quotes;
if(quotes.length){const q=quotes[Math.floor(Math.random()*quotes.length)];
document.getElementById('contact-quote-text').textContent='"'+q.text+'"';
document.getElementById('contact-quote-attr').textContent=q.by}
if(config.contact.name)document.getElementById('contact-name').textContent=config.contact.name;
const emailEl=document.getElementById('contact-email');
if(config.contact.email){emailEl.href='mailto:'+config.contact.email;emailEl.textContent='✉️ '+config.contact.email}
const linksEl=document.getElementById('contact-links');let linksHtml='';
if(config.contact.linkedin){linksHtml+='<a href="'+config.contact.linkedin+'" target="_blank" class="contact-link-btn" style="opacity:1;cursor:pointer;text-decoration:none;color:var(--text-secondary)">🔗 LinkedIn</a>'}
else{linksHtml+='<div class="contact-link-btn">🔗 LinkedIn <span class="coming-soon">Coming Soon</span></div>'}
if(config.contact.resume){linksHtml+='<a href="'+config.contact.resume+'" target="_blank" class="contact-link-btn" style="opacity:1;cursor:pointer;text-decoration:none;color:var(--text-secondary)">📄 Resume</a>'}
else{linksHtml+='<div class="contact-link-btn">📄 Resume <span class="coming-soon">Coming Soon</span></div>'}
if(config.contact.phone){linksHtml+='<a href="tel:'+config.contact.phone+'" class="contact-link-btn" style="opacity:1;cursor:pointer;text-decoration:none;color:var(--text-secondary)">📞 Phone</a>'}
else{linksHtml+='<div class="contact-link-btn">📞 Phone <span class="coming-soon">Coming Soon</span></div>'}
linksEl.innerHTML=linksHtml;
})();

// --- Footer ---
if(config.footer.text)document.getElementById('footer').textContent=config.footer.text;

// --- Spotlight ---
(function(){const g=document.getElementById('spotlight-grid');spotlight.forEach(p=>{const c=document.createElement('div');c.className='spotlight-card';c.innerHTML='<div class="spotlight-title">'+p.title+'</div><div class="spotlight-desc">'+p.desc+'</div><div class="progress-container"><div class="progress-bar '+p.barClass+'" data-width="'+p.progress+'"></div></div><div class="progress-label">'+p.progress+'% complete</div>';g.appendChild(c)});new IntersectionObserver(e=>{e.forEach(en=>{if(en.isIntersecting)en.target.querySelectorAll('.progress-bar').forEach(b=>{b.style.width=b.dataset.width+'%'})})},{threshold:0.3}).observe(g)})();

// --- Celebrations carousel ---
(function(){
let celebYearFilter='all',celebSearch='',celebIdx=0;
const rotations=[-2,1.5,-1,2,-1.5,1,-2.5,1.8,-0.5,2.5];
const glows=['royal-blue','emerald','gold','lavender','emerald','royal-blue','gold','lavender','emerald','royal-blue'];
const years=[...new Set(celebrations.map(c=>c.year))].sort((a,b)=>b-a);
const tabsEl=document.getElementById('celeb-year-tabs');
const allTab=document.createElement('button');allTab.className='book-filter-btn active';allTab.textContent='All';
allTab.addEventListener('click',()=>{celebYearFilter='all';celebIdx=0;setActiveYearTab(allTab);renderCarousel()});tabsEl.appendChild(allTab);
years.forEach(y=>{const t=document.createElement('button');t.className='book-filter-btn';t.textContent=y;
t.addEventListener('click',()=>{celebYearFilter=y;celebIdx=0;setActiveYearTab(t);renderCarousel()});tabsEl.appendChild(t)});
function setActiveYearTab(el){tabsEl.querySelectorAll('.book-filter-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active')}
document.getElementById('celeb-search').addEventListener('input',e=>{celebSearch=e.target.value.toLowerCase().trim();celebIdx=0;renderCarousel()});
document.getElementById('carousel-prev').addEventListener('click',()=>{if(celebIdx>0){celebIdx--;renderCarousel()}});
document.getElementById('carousel-next').addEventListener('click',()=>{const f=getFiltered();if(celebIdx<f.length-1){celebIdx++;renderCarousel()}});
let touchStartX=0;const container=document.getElementById('carousel-container');
container.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX},{passive:true});
container.addEventListener('touchend',e=>{const diff=touchStartX-e.changedTouches[0].clientX;const f=getFiltered();
if(Math.abs(diff)>50){if(diff>0&&celebIdx<f.length-1){celebIdx++;renderCarousel()}else if(diff<0&&celebIdx>0){celebIdx--;renderCarousel()}}});
function getFiltered(){let f=celebrations;f=[...f.filter(c=>c.pinned),...f.filter(c=>!c.pinned)];
if(celebYearFilter!=='all')f=f.filter(c=>c.year===celebYearFilter);
if(celebSearch)f=f.filter(c=>c.title.toLowerCase().includes(celebSearch)||c.desc.toLowerCase().includes(celebSearch)||(c.dateDisplay||'').toLowerCase().includes(celebSearch));
return f}
function renderCarousel(){
const filtered=getFiltered();const track=document.getElementById('carousel-track');const dotsEl=document.getElementById('carousel-dots');
track.innerHTML='';dotsEl.innerHTML='';if(celebIdx>=filtered.length)celebIdx=Math.max(0,filtered.length-1);
document.getElementById('celeb-count').textContent=filtered.length+' celebration'+(filtered.length!==1?'s':'');
if(filtered.length===0){track.innerHTML='<div class="no-results-msg">No celebrations found</div>';
document.getElementById('carousel-prev').disabled=true;document.getElementById('carousel-next').disabled=true;return}
filtered.forEach((c,i)=>{
const slide=document.createElement('div');slide.className='carousel-slide';
if(i===celebIdx)slide.classList.add('center');else if(i===celebIdx-1||i===celebIdx+1)slide.classList.add('side');else slide.classList.add('hidden-slide');
const rot=rotations[i%rotations.length];const glowVar=glows[i%glows.length];
const polaroid=document.createElement('div');polaroid.className='polaroid';
if(i===celebIdx)polaroid.style.transform='rotate('+rot+'deg)';
polaroid.style.boxShadow='0 4px 20px rgba(0,0,0,0.3),0 0 15px var(--'+glowVar+'-glow)';
const hasCoverImg=c.collageImages&&c.collageImages.length&&isValidImageUrl(c.collageImages[0]);
const coverHtml=hasCoverImg?'<img class="img-polaroid" src="'+c.collageImages[0]+'" alt="'+c.title+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="placeholder-img" style="display:none">'+c.emoji+'</div>':'<div class="placeholder-img">'+c.emoji+'</div>';
polaroid.innerHTML=(c.pinned?'<div class="polaroid-pin">⭐ Featured</div>':'')+'<div class="polaroid-photo">'+coverHtml+'</div><div class="polaroid-title">'+c.title+'</div><div class="polaroid-date">'+c.dateDisplay+'</div>';
const items=c.collageImages&&c.collageImages.length?c.collageImages:[c.emoji];
polaroid.addEventListener('click',()=>openModal(c.title,c.dateDisplay,c.desc,items));
slide.appendChild(polaroid);track.appendChild(slide)});
filtered.forEach((_,i)=>{const dot=document.createElement('button');dot.className='carousel-dot'+(i===celebIdx?' active':'');
dot.addEventListener('click',()=>{celebIdx=i;renderCarousel()});dotsEl.appendChild(dot)});
document.getElementById('carousel-prev').disabled=celebIdx===0;
document.getElementById('carousel-next').disabled=celebIdx>=filtered.length-1}
renderCarousel();
document.addEventListener('keydown',e=>{const section=document.getElementById('celebrations');const rect=section.getBoundingClientRect();
if(rect.top<window.innerHeight&&rect.bottom>0){const f=getFiltered();
if(e.key==='ArrowLeft'&&celebIdx>0){celebIdx--;renderCarousel()}if(e.key==='ArrowRight'&&celebIdx<f.length-1){celebIdx++;renderCarousel()}}})
})();

// --- Experience ---
(function(){
const EXP_PER_PAGE=4;let expPage=0;
document.getElementById('exp-prev').addEventListener('click',()=>{if(expPage>0){expPage--;renderExp()}});
document.getElementById('exp-next').addEventListener('click',()=>{if((expPage+1)*EXP_PER_PAGE<experiences.length){expPage++;renderExp()}});
function openExpModal(exp){
const c=document.getElementById('exp-modal-content');
const catLabels={work:'Work',teaching:'Teaching',volunteer:'Volunteer',freelance:'Freelance',cert:'Certification'};
let html='<div class="exp-badges" style="margin-bottom:0.8rem"><span class="exp-badge '+exp.category+'">'+(catLabels[exp.category]||exp.category)+'</span>'+(exp.current?'<span class="exp-badge current">Currently Active</span>':'')+'</div>';
html+='<div class="exp-role">'+exp.role+'</div><div class="exp-org">'+exp.org+'</div><div class="exp-duration">'+exp.duration+'</div>';
html+='<div class="exp-modal-body">'+exp.body+'</div>';
if(exp.images&&exp.images.length){html+='<div class="exp-modal-images">'+exp.images.map(function(im){
if(isValidImageUrl(im)){return '<div class="exp-modal-img"><img style="width:100%;height:100%;object-fit:cover;border-radius:12px" src="'+im+'" alt="" onerror="this.outerHTML=\'📷\'"></div>'}
return '<div class="exp-modal-img">'+im+'</div>'}).join('')+'</div>'}
if(exp.skills&&exp.skills.length){html+='<div class="exp-modal-skills">'+exp.skills.map(s=>'<span class="exp-skill-tag">'+s+'</span>').join('')+'</div>'}
if(exp.quote){html+='<div class="exp-modal-quote">"'+exp.quote+'"<span class="quote-by">'+exp.quotedBy+'</span></div>'}
c.innerHTML=html;document.getElementById('exp-modal-overlay').classList.add('active');document.body.style.overflow='hidden'}
function renderExp(){
const total=Math.max(1,Math.ceil(experiences.length/EXP_PER_PAGE));
const page=experiences.slice(expPage*EXP_PER_PAGE,(expPage+1)*EXP_PER_PAGE);
const g=document.getElementById('experience-grid');g.innerHTML='';
const catLabels={work:'Work',teaching:'Teaching',volunteer:'Volunteer',freelance:'Freelance',cert:'Certification'};
page.forEach(exp=>{const card=document.createElement('div');card.className='exp-card';
card.innerHTML='<div class="exp-card-header"><div><div class="exp-role">'+exp.role+'</div><div class="exp-org">'+exp.org+'</div><div class="exp-duration">'+exp.duration+'</div></div></div><div class="exp-badges"><span class="exp-badge '+exp.category+'">'+(catLabels[exp.category]||exp.category)+'</span>'+(exp.current?'<span class="exp-badge current">Active</span>':'')+'</div><div class="exp-preview">'+exp.preview+'</div><div class="exp-read-more">Click to read more →</div>';
card.addEventListener('click',()=>openExpModal(exp));g.appendChild(card)});
const pag=document.getElementById('exp-pagination');
if(experiences.length<=EXP_PER_PAGE){pag.classList.add('hidden')}else{pag.classList.remove('hidden');
document.getElementById('exp-page-info').textContent='Page '+(expPage+1)+' of '+total;
document.getElementById('exp-prev').disabled=expPage===0;document.getElementById('exp-next').disabled=(expPage+1)>=total}}
renderExp()})();

// --- Achievements ---
(function(){const ACH_PER_PAGE=5;let achPage=0,achCat='All';
const cats=Object.keys(achievements);
const t=document.getElementById('achievements-toggles');
const em={All:"✨",Personal:"🏅",Sports:"⚽",School:"🎓",Leadership:"👑",Projects:"🚀"};
cats.forEach((c,i)=>{const b=document.createElement('button');b.className='toggle-btn'+(i===0?' active':'');b.textContent=(em[c]||'📌')+' '+c;
b.addEventListener('click',()=>{document.querySelectorAll('.toggle-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');achCat=c;achPage=0;renderA()});t.appendChild(b)});
document.getElementById('ach-prev').addEventListener('click',()=>{if(achPage>0){achPage--;renderA()}});
document.getElementById('ach-next').addEventListener('click',()=>{if((achPage+1)*ACH_PER_PAGE<achievements[achCat].length){achPage++;renderA()}});
function renderA(){const items=achievements[achCat]||[];const total=Math.max(1,Math.ceil(items.length/ACH_PER_PAGE));
if(achPage>=total)achPage=total-1;
const page=items.slice(achPage*ACH_PER_PAGE,(achPage+1)*ACH_PER_PAGE);
const l=document.getElementById('achievements-list');l.innerHTML='';
page.forEach((a,i)=>{const d=document.createElement('div');d.className='achievement-item';d.style.animationDelay=(i*0.08)+'s';
const iconHtml=isValidImageUrl(a.icon)?'<img src="'+a.icon+'" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:8px" onerror="this.outerHTML=\'🏅\'">':a.icon;
d.innerHTML='<div class="achievement-icon">'+iconHtml+'</div><div class="achievement-info"><h4>'+a.title+'</h4><p>'+a.desc+'</p><div class="date">'+a.date+'</div></div>';l.appendChild(d)});
const pag=document.getElementById('ach-pagination');
if(items.length<=ACH_PER_PAGE){pag.classList.add('hidden')}else{pag.classList.remove('hidden');
document.getElementById('ach-page-info').textContent='Page '+(achPage+1)+' of '+total;
document.getElementById('ach-prev').disabled=achPage===0;document.getElementById('ach-next').disabled=(achPage+1)>=total}}
renderA()})();

// --- Hobbies ---
(function(){const HOB_PER_PAGE=8;let hobPage=0;
document.getElementById('hobby-prev').addEventListener('click',()=>{if(hobPage>0){hobPage--;renderH()}});
document.getElementById('hobby-next').addEventListener('click',()=>{if((hobPage+1)*HOB_PER_PAGE<hobbies.length){hobPage++;renderH()}});
function renderH(){const total=Math.max(1,Math.ceil(hobbies.length/HOB_PER_PAGE));
const page=hobbies.slice(hobPage*HOB_PER_PAGE,(hobPage+1)*HOB_PER_PAGE);
const g=document.getElementById('hobbies-grid');g.innerHTML='';
page.forEach(h=>{const c=document.createElement('div');c.className='hobby-card';
const hasGallery=h.collageImages&&h.collageImages.length;
c.innerHTML='<span class="hobby-icon">'+h.icon+'</span><div class="hobby-title">'+h.title+'</div><div class="hobby-desc">'+h.desc+'</div>'+(hasGallery?'<div class="hobby-tap-hint">Click to see gallery</div>':'');
if(hasGallery)c.addEventListener('click',()=>openModal(h.icon+' '+h.title,null,h.desc,h.collageImages));
g.appendChild(c)});
const pag=document.getElementById('hobby-pagination');
if(hobbies.length<=HOB_PER_PAGE){pag.classList.add('hidden')}else{pag.classList.remove('hidden');
document.getElementById('hobby-page-info').textContent='Page '+(hobPage+1)+' of '+total;
document.getElementById('hobby-prev').disabled=hobPage===0;document.getElementById('hobby-next').disabled=(hobPage+1)>=total}}
renderH()})();

// --- Books ---
(function(){const BOOK_PER_PAGE=6;let bookPage=0,bookFilter='all';
const finishedBooks=books.filter(b=>!b.reading).sort((a,b)=>(a.order||999)-(b.order||999));
const seriesMap={};finishedBooks.forEach(b=>{if(b.series){if(!seriesMap[b.series])seriesMap[b.series]=[];seriesMap[b.series].push(b)}});
const gridEl=document.getElementById('books-grid');const accEl=document.getElementById('series-accordion');
const pagEl=document.getElementById('book-pagination');const filtersEl=document.getElementById('books-filters');
// Currently Reading
(function(){const crContainer=document.getElementById('currently-reading-container');
const crBooks=books.filter(b=>b.reading);if(crBooks.length===0)return;
crBooks.forEach(b=>{const card=document.createElement('div');card.className='currently-reading';
card.innerHTML='<span class="cr-badge">Reading Now</span><div class="cr-info"><div class="cr-title">'+b.title+'</div><div class="cr-author">'+b.author+'</div></div>';
crContainer.appendChild(card)})})();
const filters=[{key:'all',label:'📚 All'},{key:'fav',label:'❤️ Must-Reads'},{key:5,label:'⭐ 5'},{key:4,label:'⭐ 4'},{key:3,label:'⭐ 3'},{key:'series',label:'📖 Series'}];
filters.forEach(f=>{const b=document.createElement('button');b.className='book-filter-btn'+(f.key==='all'?' active':'');b.textContent=f.label;
b.addEventListener('click',()=>{bookFilter=f.key;bookPage=0;setActiveBookFilter(b);renderBooks()});filtersEl.appendChild(b)});
function setActiveBookFilter(el){filtersEl.querySelectorAll('.book-filter-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active')}
document.getElementById('book-prev').addEventListener('click',()=>{if(bookPage>0){bookPage--;renderBooks()}});
document.getElementById('book-next').addEventListener('click',()=>{if((bookPage+1)*BOOK_PER_PAGE<getFilteredBooks().length){bookPage++;renderBooks()}});
function getFilteredBooks(){if(bookFilter==='all')return finishedBooks;if(bookFilter==='series')return[];
if(bookFilter==='fav')return finishedBooks.filter(b=>b.favorite);if(typeof bookFilter==='number')return finishedBooks.filter(b=>b.stars===bookFilter);return finishedBooks}
function renderSeriesAccordion(){accEl.innerHTML='';
const seriesReviewMap={};if(bookSeries)bookSeries.forEach(s=>{seriesReviewMap[s.name]=s.review});
Object.keys(seriesMap).forEach(name=>{const bks=seriesMap[name];
const avgStars=Math.round(bks.reduce((s,b)=>s+b.stars,0)/bks.length);
const card=document.createElement('div');card.className='series-card';
const starsHtml=Array.from({length:5},(_,i)=>'<span class="star '+(i<avgStars?'':'empty')+'">★</span>').join('');
card.innerHTML='<div class="series-header"><div class="series-header-left"><span class="series-header-icon">📖</span><div><div class="series-header-title">'+name+'</div><div class="series-header-count">'+bks.length+' book'+(bks.length!==1?'s':'')+' · Avg: <span class="series-avg-stars">'+starsHtml+'</span></div></div></div><span class="series-chevron">▼</span></div><div class="series-body"></div>';
const body=card.querySelector('.series-body');
bks.forEach(bk=>{const bookStars=Array.from({length:5},(_,i)=>'<span class="star '+(i<bk.stars?'':'empty')+'">★</span>').join('');
const row=document.createElement('div');const revId='rv-'+bk.title.replace(/[^a-zA-Z0-9]/g,'');
row.innerHTML='<div class="series-book-row"><div class="series-book-info"><div class="series-book-name">'+bk.title+'</div><div class="series-book-author">'+bk.author+'</div></div><div class="series-book-stars">'+bookStars+'</div></div><div class="series-book-review" id="'+revId+'">"'+bk.review+'"</div>';
row.querySelector('.series-book-row').addEventListener('click',()=>{document.getElementById(revId).classList.toggle('visible')});
body.appendChild(row)});
card.querySelector('.series-header').addEventListener('click',()=>{card.classList.toggle('expanded')});
accEl.appendChild(card)})}
function renderBooks(){
if(bookFilter==='series'){gridEl.style.display='none';pagEl.classList.add('hidden');accEl.classList.add('visible');renderSeriesAccordion();return}
accEl.classList.remove('visible');accEl.innerHTML='';gridEl.style.display='';
const filtered=getFilteredBooks();const total=Math.max(1,Math.ceil(filtered.length/BOOK_PER_PAGE));
if(bookPage>=total)bookPage=total-1;const page=filtered.slice(bookPage*BOOK_PER_PAGE,(bookPage+1)*BOOK_PER_PAGE);
gridEl.innerHTML='';
if(page.length===0){gridEl.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted);font-size:0.9rem">No books found for this filter</div>'}
page.forEach(b=>{const c=document.createElement('div');c.className='book-card';
const s=Array.from({length:5},(_,i)=>'<span class="star '+(i<b.stars?'':'empty')+'">★</span>').join('');
c.innerHTML='<div class="book-inner"><div class="book-front">'+(b.favorite?'<div style="position:absolute;top:12px;right:14px;font-size:0.9rem" title="Must-Read">❤️</div>':'')+'<div class="book-title-text">'+b.title+'</div><div class="book-author">'+b.author+'</div>'+(b.series?'<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.5rem">📖 '+b.series+'</div>':'')+'<div class="book-stars">'+s+'</div><div class="book-flip-hint">Click to read review →</div></div><div class="book-back"><div class="book-review-label">My Review</div><div class="book-review-text">"'+b.review+'"</div><div class="book-flip-hint">← Click to flip back</div></div></div>';
c.addEventListener('click',()=>c.classList.toggle('flipped'));gridEl.appendChild(c)});
if(filtered.length<=BOOK_PER_PAGE){pagEl.classList.add('hidden')}else{pagEl.classList.remove('hidden');
document.getElementById('book-page-info').textContent='Page '+(bookPage+1)+' of '+total;
document.getElementById('book-prev').disabled=bookPage===0;document.getElementById('book-next').disabled=(bookPage+1)>=total}}
renderBooks()})();

// --- Blog ---
(function(){
const SHOW_LATEST=4;let calMonth=new Date().getMonth(),calYear=new Date().getFullYear();let activeFilter='all';
const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
blogPosts.forEach(p=>{const d=new Date(p.date);p._year=d.getFullYear();p._month=d.getMonth();p._day=d.getDate()});
const months=[];const seen={};blogPosts.forEach(p=>{const k=p._year+'-'+p._month;if(!seen[k]){seen[k]=1;months.push({year:p._year,month:p._month})}});
months.sort((a,b)=>b.year-a.year||b.month-a.month);
const tabsEl=document.getElementById('blog-month-tabs');
const allTab=document.createElement('button');allTab.className='month-tab active';allTab.textContent='All';
allTab.addEventListener('click',()=>{activeFilter='all';setActiveTab(allTab);renderBlog()});tabsEl.appendChild(allTab);
months.forEach(m=>{const t=document.createElement('button');t.className='month-tab';t.textContent=monthNames[m.month]+' '+m.year;
t.addEventListener('click',()=>{activeFilter=m;setActiveTab(t);renderBlog()});tabsEl.appendChild(t)});
function setActiveTab(el){document.querySelectorAll('.month-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active')}
const calEl=document.getElementById('mini-calendar');
document.getElementById('cal-toggle').addEventListener('click',function(){calEl.classList.toggle('visible');this.classList.toggle('active')});
function renderCalendar(){
const label=document.getElementById('cal-month-label');label.textContent=monthNames[calMonth]+' '+calYear;
const grid=document.getElementById('cal-grid');grid.innerHTML='';
['S','M','T','W','T','F','S'].forEach(d=>{const el=document.createElement('div');el.className='cal-day-label';el.textContent=d;grid.appendChild(el)});
const firstDay=new Date(calYear,calMonth,1).getDay();const daysInMonth=new Date(calYear,calMonth+1,0).getDate();const today=new Date();
for(let i=0;i<firstDay;i++){const el=document.createElement('div');el.className='cal-day';grid.appendChild(el)}
for(let d=1;d<=daysInMonth;d++){const el=document.createElement('div');el.className='cal-day current-month';el.textContent=d;
const post=blogPosts.find(p=>p._year===calYear&&p._month===calMonth&&p._day===d);
if(post){el.classList.add('has-post');const tip=document.createElement('div');tip.className='cal-tooltip';tip.textContent=post.title;el.appendChild(tip);
el.addEventListener('click',()=>{activeFilter={year:calYear,month:calMonth};document.querySelectorAll('.month-tab').forEach(t=>t.classList.remove('active'));renderBlog();
setTimeout(()=>{const target=document.querySelector('[data-post-date="'+post.date+'"]');if(target)target.scrollIntoView({behavior:'smooth',block:'center'})},100)})}
if(today.getFullYear()===calYear&&today.getMonth()===calMonth&&today.getDate()===d)el.classList.add('today');
grid.appendChild(el)}}
renderCalendar();
document.getElementById('cal-prev').addEventListener('click',()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--}renderCalendar()});
document.getElementById('cal-next').addEventListener('click',()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++}renderCalendar()});
function renderOnThisDay(){const c=document.getElementById('on-this-day-container');c.innerHTML='';
const today=new Date();const td=today.getDate(),tm=today.getMonth();
const match=blogPosts.find(p=>p._day===td&&p._month===tm&&p._year<today.getFullYear());
const post=match||blogPosts.find(p=>p._year<new Date().getFullYear());
if(post){const label=match?'On This Day':'Memory';
c.innerHTML='<div class="on-this-day" id="otd-card"><div class="on-this-day-icon">💫</div><div><div class="on-this-day-label">'+label+' — '+post._year+'</div><div class="on-this-day-title">'+post.title+'</div><div class="on-this-day-date">'+post.dateDisplay+' · Click to read</div></div></div>';
document.getElementById('otd-card').addEventListener('click',()=>{
let html='<h2 class="modal-title">'+post.title+'</h2><p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">'+post.dateDisplay+'</p><p class="modal-description">'+post.text+'</p>';
if(post.collageImages&&post.collageImages.length&&isValidImageUrl(post.collageImages[0])){html+='<div class="blog-image"><img style="width:100%;height:100%;object-fit:cover;border-radius:10px" src="'+post.collageImages[0]+'" alt=""></div>'}
else if(post.hasImage){html+='<div class="blog-image">'+(post.emoji||'📷')+'</div>'}
document.getElementById('modal-body').innerHTML=html;document.getElementById('modal-overlay').classList.add('active');document.body.style.overflow='hidden'})}}
renderOnThisDay();
function renderBlog(){
const container=document.getElementById('blog-year-sections');container.innerHTML='';
let filtered=blogPosts;
if(activeFilter!=='all'&&activeFilter.year!==undefined)filtered=blogPosts.filter(p=>p._year===activeFilter.year&&p._month===activeFilter.month);
const latest=filtered.slice(0,SHOW_LATEST);let lastYear=null;
latest.forEach(p=>{if(p._year!==lastYear){lastYear=p._year;
const yd=document.createElement('div');yd.className='year-divider';yd.innerHTML='<span>— '+p._year+' —</span>';container.appendChild(yd)}
const tl=document.createElement('div');tl.className='blog-timeline';tl.style.marginBottom='0';tl.style.paddingBottom='0';
const post=document.createElement('div');post.className='blog-post';post.setAttribute('data-post-date',p.date);
let h='<div class="blog-date">'+p.dateDisplay+'</div><div class="blog-post-title">'+p.title+'</div><div class="blog-text">'+p.text+'</div>';
if(p.collageImages&&p.collageImages.length&&isValidImageUrl(p.collageImages[0])){h+='<div class="blog-image"><img style="width:100%;height:100%;object-fit:cover;border-radius:10px" src="'+p.collageImages[0]+'" alt="" onerror="this.outerHTML=\''+(p.emoji||'📷')+'\'"></div>'}
else if(p.hasImage){h+='<div class="blog-image">'+(p.emoji||'📷')+'</div>'}
post.innerHTML=h;tl.appendChild(post);container.appendChild(tl)});
const btn=document.getElementById('view-all-btn');const allList=document.getElementById('all-posts-list');
if(filtered.length>SHOW_LATEST){btn.style.display='block';
btn.onclick=()=>{const showing=allList.classList.toggle('visible');btn.textContent=showing?'Show Less ↑':'View All Anecdotes ↓';
if(showing&&allList.children.length===0)renderAllList(filtered)}}
else{btn.style.display='none';allList.classList.remove('visible');allList.innerHTML=''}}
function renderAllList(posts){const el=document.getElementById('all-posts-list');el.innerHTML='';
let lastYear=null;posts.slice(SHOW_LATEST).forEach(p=>{
if(p._year!==lastYear&&p._year!==(posts[SHOW_LATEST-1]||{})._year){lastYear=p._year;
const yd=document.createElement('div');yd.className='year-divider';yd.style.paddingLeft='0';yd.innerHTML='<span>— '+p._year+' —</span>';el.appendChild(yd)}
const entry=document.createElement('div');entry.className='all-post-entry';
entry.innerHTML='<div class="entry-date">'+p.dateDisplay+'</div><div class="entry-title">'+p.title+'</div><div class="entry-preview">'+p.text.substring(0,80)+'...</div><div class="entry-full">'+p.text+(p.collageImages&&p.collageImages.length&&isValidImageUrl(p.collageImages[0])?'<div class="blog-image" style="height:140px;margin-top:0.8rem"><img style="width:100%;height:100%;object-fit:cover;border-radius:10px" src="'+p.collageImages[0]+'" alt=""></div>':(p.hasImage?'<div class="blog-image" style="height:140px;margin-top:0.8rem">'+(p.emoji||'📷')+'</div>':''))+'</div>';
entry.addEventListener('click',()=>entry.classList.toggle('expanded'));el.appendChild(entry)})}
renderBlog()})();

// --- Corkboard ---
(function(){
const PER_PAGE=10;let corkPage=0,corkSectionFilter='All',corkMonthFilter='all';
const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
corkboardNotes.forEach(n=>{const d=new Date(n.date);n._year=d.getFullYear();n._month=d.getMonth();n._day=d.getDate()});
corkboardNotes.sort((a,b)=>new Date(b.date)-new Date(a.date));
const sections=['All','Celebrations','Achievements','Hobbies','Books','General'];
const secEl=document.getElementById('cork-section-filters');
sections.forEach(s=>{const b=document.createElement('button');b.className='cork-filter-btn'+(s==='All'?' active':'');b.textContent=s==='All'?'📋 All':'📌 '+s;
b.addEventListener('click',()=>{corkSectionFilter=s;corkPage=0;secEl.querySelectorAll('.cork-filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderCork()});
secEl.appendChild(b)});
const corkMonths=[];const corkSeen={};
corkboardNotes.forEach(n=>{const k=n._year+'-'+n._month;if(!corkSeen[k]){corkSeen[k]=1;corkMonths.push({year:n._year,month:n._month})}});
corkMonths.sort((a,b)=>b.year-a.year||b.month-a.month);
const moEl=document.getElementById('cork-month-filters');
const allMo=document.createElement('button');allMo.className='cork-filter-btn active';allMo.textContent='All Dates';
allMo.addEventListener('click',()=>{corkMonthFilter='all';corkPage=0;moEl.querySelectorAll('.cork-filter-btn').forEach(x=>x.classList.remove('active'));allMo.classList.add('active');renderCork()});
moEl.appendChild(allMo);
corkMonths.forEach(m=>{const b=document.createElement('button');b.className='cork-filter-btn';b.textContent=monthNames[m.month]+' '+m.year;
b.addEventListener('click',()=>{corkMonthFilter=m;corkPage=0;moEl.querySelectorAll('.cork-filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderCork()});
moEl.appendChild(b)});
document.getElementById('cork-prev').addEventListener('click',()=>{if(corkPage>0){corkPage--;renderCork()}});
document.getElementById('cork-next').addEventListener('click',()=>{const f=getFiltered();if((corkPage+1)*PER_PAGE<f.length){corkPage++;renderCork()}});
function getFiltered(){let f=corkboardNotes;if(corkSectionFilter!=='All')f=f.filter(n=>n.section===corkSectionFilter);
if(corkMonthFilter!=='all')f=f.filter(n=>n._year===corkMonthFilter.year&&n._month===corkMonthFilter.month);return f}
function renderCork(){
const filtered=getFiltered();const totalPages=Math.max(1,Math.ceil(filtered.length/PER_PAGE));
if(corkPage>=totalPages)corkPage=totalPages-1;
const page=filtered.slice(corkPage*PER_PAGE,(corkPage+1)*PER_PAGE);
const board=document.getElementById('corkboard-notes');board.innerHTML='';
if(page.length===0){board.innerHTML='<div style="text-align:center;padding:2rem;color:var(--polaroid-text);opacity:0.5;font-family:Sora,sans-serif;font-size:0.9rem">No notes found for this filter</div>'}
page.forEach(n=>{const d=document.createElement('div');d.className='cork-note '+n.color;d.style.transform='rotate('+n.rotate+'deg)';
d.innerHTML='<span class="note-author">'+n.author+':</span> '+n.text+'<span class="note-date">'+n.dateDisplay+' · '+n.section+'</span>';board.appendChild(d)});
document.getElementById('cork-note-count').textContent='🎉 '+filtered.length+' shoutout'+(filtered.length!==1?'s':'')+' from the hype squad';
document.getElementById('cork-page-info').textContent='Page '+(corkPage+1)+' of '+totalPages;
document.getElementById('cork-prev').disabled=corkPage===0;document.getElementById('cork-next').disabled=(corkPage+1)>=totalPages}
renderCork()})();

// --- Leave a Note form ---
(function(){
const nameEl=document.getElementById('note-name');const msgEl=document.getElementById('note-message');
const charCount=document.getElementById('note-char-count');const submitBtn=document.getElementById('note-submit');
const formView=document.getElementById('note-form-view');const successView=document.getElementById('note-success-view');
let selectedEmoji='';
function validate(){submitBtn.disabled=!(nameEl.value.trim()&&msgEl.value.trim())}
nameEl.addEventListener('input',validate);
msgEl.addEventListener('input',()=>{const len=msgEl.value.length;charCount.textContent=len+' / 150';
charCount.className='note-char-count'+(len>=140?' at-limit':len>=120?' near-limit':'');validate()});
document.querySelectorAll('.emoji-pick').forEach(e=>{e.addEventListener('click',()=>{
document.querySelectorAll('.emoji-pick').forEach(x=>x.classList.remove('selected'));
if(selectedEmoji===e.dataset.emoji){selectedEmoji=''}else{selectedEmoji=e.dataset.emoji;e.classList.add('selected')}})});
submitBtn.addEventListener('click',async()=>{
if(!nameEl.value.trim()||!msgEl.value.trim())return;
submitBtn.disabled=true;submitBtn.textContent='Sending...';
try{const r=await fetch('/api/submit-note',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({author:nameEl.value.trim(),text:(selectedEmoji?selectedEmoji+' ':'')+msgEl.value.trim(),section:'General'})});
if(r.ok){formView.style.display='none';successView.style.display='block'}
else{submitBtn.textContent='Send Note 💌';submitBtn.disabled=false}}
catch(err){submitBtn.textContent='Send Note 💌';submitBtn.disabled=false}});
document.getElementById('note-send-another').addEventListener('click',()=>{
nameEl.value='';msgEl.value='';selectedEmoji='';charCount.textContent='0 / 150';charCount.className='note-char-count';
document.querySelectorAll('.emoji-pick').forEach(x=>x.classList.remove('selected'));submitBtn.disabled=true;
formView.style.display='block';successView.style.display='none'})})();

}catch(err){console.error('Failed to load content:',err)}
})();
