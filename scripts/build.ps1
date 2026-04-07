# build.ps1 — Generate Notion-powered index.html from index.html.html
# Run: powershell -ExecutionPolicy Bypass -File scripts\build.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$src  = Join-Path $root 'index.html.html'
$dest = Join-Path $root 'index.html'

$html = [System.IO.File]::ReadAllText($src, [System.Text.Encoding]::UTF8)
Write-Host "Read $([math]::Round($html.Length/1024))KB from index.html.html"

# ── 1. Remove hardcoded data declarations ──────────────────────────────────────
$html = [regex]::Replace($html,
  'const spotlightProjects=\[[\s\S]*?const corkboardNotes=\[[\s\S]*?\];\r?\n',
  '',
  'Singleline')
Write-Host "  [1] Removed data declarations"

# ── 2. Remove hardcoded typing animation IIFE ──────────────────────────────────
$html = [regex]::Replace($html,
  '// Typing\r?\n\(function\(\)\{const t=\["Dreamer[\s\S]*?800\)\}\)\(\);\r?\n',
  '',
  'Singleline')
Write-Host "  [2] Removed hardcoded typing animation"

# ── 3. Remove hardcoded fun facts IIFE ─────────────────────────────────────────
$html = [regex]::Replace($html,
  '// Fun facts rotation\r?\n\(function\(\)\{const facts=\[[\s\S]*?\]\}\)\(\);\r?\n',
  '',
  'Singleline')
Write-Host "  [3] Removed hardcoded fun facts"

# ── 4. Remove hardcoded contact quotes IIFE ────────────────────────────────────
$html = [regex]::Replace($html,
  '// Rotating contact quotes\r?\n\(function\(\)\{const quotes=\[[\s\S]*?\}\)\(\);\r?\n',
  '',
  'Singleline')
Write-Host "  [4] Removed hardcoded contact quotes"

# ── 5. Inject async IIFE before Spotlight section ──────────────────────────────
$asyncOpen = @'
// ── Notion CMS: load all content, then render data-driven sections ──────────
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
const _funFacts=((_cfg.about||{}).funFacts)||["Has visited 7 countries \u2708\uFE0F","Knows 3 languages \uD83D\uDDE3\uFE0F"];
const _quotes=((_cfg.contact||{}).quotes)||[{text:"Stars can't shine without darkness.",by:"\u2014 D.H. Sidebottom"}];

// Apply config to static DOM elements
if(_cfg.about){const ab=_cfg.about;if(ab.photoEmoji){const el=document.querySelector('.about-photo');if(el)el.textContent=ab.photoEmoji;}const tags=document.querySelectorAll('.stat-tag');if(ab.location&&tags[1])tags[1].innerHTML='<span class="label">Location</span> '+ab.location;if(ab.profession&&tags[2])tags[2].innerHTML='<span class="label">Profession</span> '+ab.profession;if(ab.liveStatus){const ls=document.querySelector('.live-status span');if(ls)ls.textContent='Currently: '+ab.liveStatus;}}
if(_cfg.contact&&_cfg.contact.email){const el=document.querySelector('.contact-email');if(el){el.href='mailto:'+_cfg.contact.email;el.innerHTML='\u2709\uFE0F '+_cfg.contact.email;}}

// Typing animation (Notion taglines)
(function(){const t=_taglines,e=document.getElementById('typed-text');let li=0,ci=0,dl=false;function tp(){const l=t[li];if(!dl){e.textContent=l.substring(0,ci+1);ci++;if(ci>=l.length){setTimeout(()=>{dl=true;tp()},2000);return}setTimeout(tp,60+Math.random()*40)}else{e.textContent=l.substring(0,ci);ci--;if(ci<0){dl=false;ci=0;li=(li+1)%t.length;setTimeout(tp,500);return}setTimeout(tp,30)}}setTimeout(tp,800)})();

// Fun facts (Notion config)
if(_funFacts.length)document.getElementById('fun-fact').textContent=_funFacts[Math.floor(Math.random()*_funFacts.length)];

// Contact quotes (Notion config)
(function(){const q=_quotes[Math.floor(Math.random()*_quotes.length)];document.getElementById('contact-quote-text').textContent='"'+q.text+'"';document.getElementById('contact-quote-attr').textContent=q.by;})();

'@

$html = $html -replace '// Spotlight', ($asyncOpen + '// Spotlight')
Write-Host "  [5] Injected async IIFE opening"

# ── 6. Close async IIFE after corkboard section ────────────────────────────────
$html = [regex]::Replace($html,
  '(renderCork\(\);\r?\n\}\)\(\);\r?\n)(\r?\n// Modal)',
  ('$1' + "`r`n})(); // end Notion CMS async IIFE`r`n" + '$2'),
  'Singleline')
Write-Host "  [6] Closed async IIFE"

# ── 7. Update Leave-a-Note submit handler to call /api/submit-note ─────────────
$oldSubmit = "submitBtn.addEventListener('click',()=>{`nif(nameEl.value.trim()&&msgEl.value.trim()){`nformView.style.display='none';successView.style.display='block';`n// Phase 2: send to CMS here`n}});"
$newSubmit = "submitBtn.addEventListener('click',async ()=>{`nif(nameEl.value.trim()&&msgEl.value.trim()){`nsubmitBtn.disabled=true;`ntry{await fetch('/api/submit-note',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:nameEl.value.trim(),text:msgEl.value.trim()+(selectedEmoji?' '+selectedEmoji:''),section:'General'})});}catch(e){console.error('Note submit error:',e);}`nformView.style.display='none';successView.style.display='block';}});"
$html = $html.Replace($oldSubmit, $newSubmit)
Write-Host "  [7] Updated submit handler"

# ── Write output ───────────────────────────────────────────────────────────────
[System.IO.File]::WriteAllText($dest, $html, [System.Text.Encoding]::UTF8)
$kb = [math]::Round((Get-Item $dest).Length / 1024)
Write-Host "`n  Written index.html ($kb KB)"

# ── Verification ───────────────────────────────────────────────────────────────
$checks = @(
  @("Notion async IIFE open",              $html.Contains("end Notion CMS async IIFE")),
  @("Fetch /api/content",                  $html.Contains("fetch('/api/content')")),
  @("Fetch /api/submit-note",              $html.Contains("fetch('/api/submit-note')")),
  @("Typing uses _taglines",               $html.Contains("const t=_taglines")),
  @("Fun facts from config",               $html.Contains("_funFacts")),
  @("Contact quotes from config",          $html.Contains("_quotes")),
  @("No hardcoded spotlightProjects",      -not $html.Contains("const spotlightProjects=[")),
  @("No hardcoded corkboardNotes",         -not $html.Contains("const corkboardNotes=[")),
  @("Submit handler is async",             $html.Contains("submitBtn.disabled=true"))
)

Write-Host ""
$allOk = $true
foreach ($c in $checks) {
  $icon = if ($c[1]) { "OK" } else { "FAIL"; $allOk = $false }
  Write-Host "  [$icon]  $($c[0])"
}

if (-not $allOk) {
  Write-Host "`nSome checks failed. Review the output." -ForegroundColor Red
  exit 1
} else {
  Write-Host "`nAll checks passed. index.html is ready to deploy!" -ForegroundColor Green
}
