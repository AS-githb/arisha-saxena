# Option 4 Implementation Plan: Explorea as Subfolder
## Deploy to `arishasaxena.vercel.app/explorea/`

**Date**: 2026-03-27
**Status**: Planning phase
**Scope**: Integrate standalone Explorea into main portfolio at `/explorea/` path

---

## Current State

### Main Site
- **URL**: `arishasaxena.vercel.app`
- **Root files**: `index.html` (generated), `index.html.html` (template)
- **Tech**: Notion CMS, Vercel serverless functions at `/api/`
- **Nav structure**: Fixed navbar with links to portfolio sections

### Explorea
- **Current**: `explorea_v2.html` (standalone, 6,669 lines, 488KB)
- **Status**: Fully functional, 26 diagrams, self-contained
- **Assets**: Everything embedded (no external file dependencies)

---

## Option 4 Architecture

```
arishasaxena.vercel.app
├── /                          (main portfolio - unchanged)
│   ├── index.html (generated)
│   ├── index.html.html (template)
│   ├── api/
│   ├── scripts/
│   └── vercel.json
│
└── /explorea/                 (NEW: Explorea subfolder)
    ├── index.html             (renamed from explorea_v2.html + patched)
    └── (no other assets needed—fully self-contained)
```

**Benefits of this approach:**
- ✅ Everything on one domain
- ✅ Clean URL separation (`/explorea/`)
- ✅ No cross-origin issues
- ✅ Single deployment pipeline
- ✅ Easy back-navigation to main site
- ✅ Minimal Vercel configuration changes

---

## Implementation Steps

### Phase 1: Prepare Explorea for Subfolder (2-3 hours)

#### Step 1a: Copy & Prepare File
```bash
# Copy explorea_v2.html to explorea/ folder
cp explorea_v2.html explorea/index.html

# Result:
# /explorea/index.html  (this is what Vercel will serve at /explorea/)
```

#### Step 1b: Identify & Fix Base Path Issues
**Audit for relative path issues** (explorea_v2.html is currently self-contained, but verify):

Patterns to search for:
```javascript
// Check for these patterns in explorea/index.html:
href="style.css"         // Would break if in subfolder
src="script.js"          // Would break if in subfolder
URL(/api/...)            // API calls—NEED ATTENTION
fetch('/api/...')        // API calls—NEED ATTENTION
window.location = '/'    // Would go to root, not /explorea/
<a href="/">             // Navigation anchors
<a href="#section">      // Note: these should work fine
```

**In `explorea_v2.html`, look for:**
```javascript
// Current (if it navigates back to main site):
onclick="window.location='/';"  // Takes to root index

// Should become:
onclick="window.location='/';"  // This should go to main site (correct!)
// OR add a back button:
<div class="nav-back" onclick="window.location='/';">← Back to portfolio</div>
```

**Reality check**: `explorea_v2.html` is fully self-contained (no external CSS/JS, all inline), so **no path fixes likely needed**. But verify:
- [ ] Search for `href="` (relative links)
- [ ] Search for `src="` (relative assets)
- [ ] Check for hardcoded `/api/` calls (none expected)
- [ ] Check for hardcoded `/` navigation (the "close" button)

#### Step 1c: Add Base Path Awareness (OPTIONAL Enhancement)
If you want Explorea to be self-aware of its path:

```javascript
// Add at top of explorea/index.html, in <script> tag, very first:
const EXPLOREA_BASE_PATH = '/explorea/';
const EXPLOREA_ROOT = window.location.origin;

// Use in navigation:
document.querySelector('.logo').onclick = () => {
  window.location = EXPLOREA_ROOT;  // Goes to main site root
};

// Alternative: Add a dedicated back navigation
const navRight = document.querySelector('.nav-right');
if (navRight) {
  const backLink = document.createElement('a');
  backLink.href = '/';
  backLink.textContent = '← Arisha';
  backLink.style.cssText = `
    text-decoration: none;
    color: var(--ink2);
    font-size: 13px;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    transition: all 0.2s;
  `;
  backLink.onmouseover = () => backLink.style.background = 'var(--bg3)';
  backLink.onmouseout = () => backLink.style.background = '';
  navRight.insertBefore(backLink, navRight.firstChild);
}
```

**Recommendation**: Skip this for now. Explorea's "close viewer" → "home" button already works fine. Just ensure the logo click returns to `/explorea/` home (which it should).

---

### Phase 2: Update Main Site Navigation (30-45 min)

#### Step 2a: Add Navigation Link in Main `index.html.html` Template
Open `index.html.html` (the template), find the navbar section:

```html
<!-- Current navbar links, find the nav-links section -->
<ul class="nav-links">
  <li><a href="#about">About</a></li>
  <li><a href="#experiences">Experience</a></li>
  <li><a href="#achievements">Achievements</a></li>
  <!-- ADD THIS LINE: -->
  <li><a href="/explorea/">Explorea</a></li>
  <!-- Or with icon: -->
  <li><a href="/explorea/">🔬 Explorea</a></li>
</ul>
```

**Option A**: Simple link
```html
<li><a href="/explorea/">Explorea</a></li>
```

**Option B**: With emoji icon (matches Explorea branding)
```html
<li><a href="/explorea/" style="display:flex; align-items:center; gap:0.3rem;">
  <span>🔬</span>
  <span>Explorea</span>
</a></li>
```

**Option C**: Highlight as featured (if you want it prominent)
```html
<li><a href="/explorea/" class="nav-link-featured">🔬 Explorea</a></li>

<!-- Add CSS: -->
<style>
.nav-link-featured {
  padding: 0.4rem 0.9rem !important;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  background: rgba(45, 125, 90, 0.1);  /* Explorea green tint */
  box-shadow: 0 0 8px rgba(45, 125, 90, 0.15);
  transition: all 0.3s;
}
.nav-link-featured:hover {
  background: rgba(45, 125, 90, 0.2);
  box-shadow: 0 0 12px rgba(45, 125, 90, 0.25);
}
</style>
```

#### Step 2b: Rebuild Main Site
```bash
# Run build script to regenerate index.html from template
powershell -ExecutionPolicy Bypass -File scripts/build.ps1

# Verify: check root index.html now includes the /explorea/ link
```

---

### Phase 3: Update Vercel Configuration (15 min)

#### Step 3a: Update `vercel.json` (optional but recommended)

**Current** `vercel.json`:
```json
{
  "functions": {
    "api/*.js": {
      "memory": 256
    }
  }
}
```

**Recommended update** (adds explicit routing for clarity):
```json
{
  "functions": {
    "api/*.js": {
      "memory": 256
    }
  },
  "rewrites": [
    {
      "source": "/explorea",
      "destination": "/explorea/index.html"
    },
    {
      "source": "/explorea/:path*",
      "destination": "/explorea/index.html"
    }
  ]
}
```

**Why**: This ensures Vercel treats `/explorea/` as a single-page app (rewrite all paths to `index.html` so Explorea's internal routing works).

**However**: Explorea doesn't use client-side routing—it's just a standalone page. So this is **optional**. Vercel will automatically serve `/explorea/index.html` when you hit `/explorea/` anyway.

**Conservative approach** (keep `vercel.json` unchanged):
- Vercel auto-serves `index.html` at folder roots
- Just need to create the `/explorea/` folder with `index.html` inside
- ✅ Works fine!

---

### Phase 4: Add Explorea to Portfolio Home (OPTIONAL)

If you want to showcase Explorea on the main portfolio homepage, add a featured card/link:

#### Option A: Add to Spotlight Section
```html
<!-- In index.html.html, find spotlight grid section -->
<div class="spotlight-grid">
  <div class="spotlight-card">
    <!-- existing card -->
  </div>

  <!-- NEW Explorea card -->
  <div class="spotlight-card" style="border: 1px solid rgba(45,125,90,0.3); background: rgba(45,125,90,0.05);">
    <div class="spotlight-status writing" style="background: rgba(45,125,90,0.15); border: 1px solid rgba(45,125,90,0.3); color: #2D7D5A;">
      🔬 Active
    </div>
    <div class="spotlight-title">Explorea</div>
    <div class="spotlight-desc">
      Interactive science diagrams for NCERT Class 9–12. Explore biology, chemistry, and physics with clickable, labeled diagrams.
    </div>
    <a href="/explorea/" style="
      display: inline-block;
      color: #2D7D5A;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.85rem;
      padding: 0.5rem 1rem;
      border: 1px solid rgba(45,125,90,0.3);
      border-radius: 8px;
      transition: all 0.3s;
    ">
      Explore →
    </a>
  </div>
</div>
```

#### Option B: Add as Featured Project Banner
```html
<!-- After hero, before spotlight section -->
<section style="padding: 2rem; background: linear-gradient(135deg, rgba(45,125,90,0.1), rgba(45,125,90,0.05)); border-radius: 20px; max-width: 900px; margin: 2rem auto; text-align: center;">
  <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔬</div>
  <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Explorea — Interactive Science</h2>
  <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
    Click-to-explore diagrams for NCERT science. Zoom in, toggle layers, and understand 26 diagrams across biology, chemistry, and physics.
  </p>
  <a href="/explorea/" style="
    display: inline-block;
    background: #2D7D5A;
    color: white;
    padding: 0.8rem 2rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
  ">
    Open Explorea →
  </a>
</section>
```

**Recommendation**: Optional. Wait until after Phase 1-3 are live, then add if desired.

---

### Phase 5: Testing & Deployment (1-2 hours)

#### Step 5a: Local Testing (if possible)
```bash
# Install Vercel CLI locally (optional)
npm install -g vercel

# Test locally (simulates Vercel environment)
vercel dev

# Visit http://localhost:3000/explorea/
# Verify:
# - Page loads ✓
# - All diagrams render ✓
# - SVGs display correctly ✓
# - Zoom/pan works ✓
# - Layer toggles work ✓
# - Search/filter works ✓
# - Back button (close) returns to /explorea/ home ✓
# - Logo click returns to portfolio root ✓
```

#### Step 5b: Staging on Vercel
```bash
# (If using git-based deployments)
# Push explorea/ folder to GitHub
# Vercel auto-deploys from main branch

# OR use Vercel deploy script from your existing setup:
powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1

# Verify deployment:
# https://arishasaxena.vercel.app/explorea/
```

#### Step 5c: Verification Checklist
- [ ] Main site loads: `https://arishasaxena.vercel.app/`
- [ ] Explorea loads: `https://arishasaxena.vercel.app/explorea/`
- [ ] Navbar has Explorea link (if added)
- [ ] Clicking "Explorea" nav link → `/explorea/` loads
- [ ] Inside Explorea, logo click returns to portfolio
- [ ] All 26 diagrams render correctly
- [ ] Zoom, pan, layer toggle, search all work
- [ ] Mobile responsive (test on mobile device)
- [ ] Open Graph metadata correct (for sharing)
- [ ] Performance acceptable (lighthouse score)

---

## File Structure After Implementation

```
Website/
├── index.html                 (main portfolio, generated)
├── index.html.html            (template with /explorea/ nav link added)
├── explorea_v2.html           (KEEP as backup or delete)
│
├── explorea/                  (NEW FOLDER)
│   └── index.html             (renamed explorea_v2.html, may have tweaks)
│
├── api/
│   ├── content.js
│   └── submit-note.js
│
├── scripts/
│   ├── build.ps1
│   ├── build.js
│   └── deploy.ps1
│
├── vercel.json                (OPTIONAL: add rewrites for /explorea/)
├── package.json
├── .env.example
│
└── EXPLOREA_CODE_IMPROVEMENTS.md
```

---

## Key Decisions & Trade-offs

| Decision | Why | Trade-off |
|----------|-----|-----------|
| Use `/explorea/index.html` format | Standard Vercel folder structure, clean URLs | None—this is the best practice |
| Keep Explorea self-contained | No external dependencies, no broken links | Single large file (6.7 MB) at `/explorea/` |
| Add nav link in main portfolio | Discoverable, integrated experience | Requires rebuild of main site |
| No base path patching (unless needed) | Explorea works as-is | Must verify no relative paths exist |
| Single `.html` file (not modular) | Works perfectly for current size/scope | Hard to maintain (see EXPLOREA_CODE_IMPROVEMENTS.md) |

---

## Deployment Flow

```
1. Create /explorea/ folder
   └── cp explorea_v2.html explorea/index.html

2. Update index.html.html template
   └── Add <li><a href="/explorea/">Explorea</a></li> to navbar

3. Rebuild main site
   └── powershell -ExecutionPolicy Bypass -File scripts/build.ps1

4. (OPTIONAL) Update vercel.json
   └── Add rewrite rules for /explorea/* → /explorea/index.html

5. Deploy to Vercel
   └── Git push OR use scripts/deploy.ps1

6. Verify both sites work
   └── https://arishasaxena.vercel.app/
   └── https://arishasaxena.vercel.app/explorea/
```

---

## Timeline

| Phase | Task | Time | Owner |
|-------|------|------|-------|
| 1 | Prepare Explorea for subfolder | 30 min | You |
| 1 | Audit for path issues | 30 min | You |
| 1 | (OPTIONAL) Add back-nav | 30 min | You |
| 2 | Add nav link to main site | 15 min | You |
| 2 | Rebuild main site | 15 min | You |
| 3 | Update vercel.json | 15 min | You |
| 4 | (OPTIONAL) Add spotlight card | 30 min | You |
| 5 | Test locally | 30 min | You |
| 5 | Deploy to Vercel | 10 min | You |
| 5 | Verification testing | 30 min | You |
| | **TOTAL** | **~4 hours** | |

---

## Risks & Mitigation

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Explorea has relative paths that break | Low | Audit step (#1b) catches these |
| Vercel routing misconfiguration | Low | Conservative approach: keep vercel.json as-is |
| Main portfolio build fails | Very Low | Always have backup of `index.html` before rebuild |
| Navigation links don't work | Very Low | Test in browser immediately after deploy |
| Performance issue (large file) | Low | Explorea is self-contained, no extra reqs |

**Rollback Plan**: If anything breaks, you can instantly:
```bash
# Delete /explorea/ folder
# Revert index.html.html changes
# Redeploy main site
# Everything is back to previous state
```

---

## Post-Implementation Future Work

Once Option 4 is live, consider:

1. **Phase 1 of EXPLOREA_CODE_IMPROVEMENTS.md**
   - Add architectural comments (15 min)
   - Extract COLORS object (30 min)
   - Create AppState (1-2 hours)

2. **Monitor Analytics**
   - Track traffic to `/explorea/`
   - Monitor bounce rate, engagement
   - Gather user feedback

3. **Consider a "Projects" Section**
   - If you build more tools like Explorea, create `/projects/` folder
   - Add a projects index page
   - link from main nav

4. **Explorea SEO Optimizations**
   - Add sitemap entry for /explorea/
   - Open Graph tags for social sharing
   - Mobile-specific optimizations

---

## Questions to Answer Before Starting

**Clarify these with yourself:**

1. **Navigation preference**: Do you want the Explorea link in main navbar?
   - [ ] Yes, simple text link
   - [ ] Yes, with icon emoji
   - [ ] Yes, highlighted/featured
   - [ ] No, don't add nav link (users access via direct link)

2. **Legacy file**: Keep or delete `explorea_v2.html`?
   - [ ] Keep as backup (takes up space)
   - [ ] Delete (can always restore from git)

3. **Homepage card**: Feature Explorea on main portfolio page?
   - [ ] Add spotlight card
   - [ ] Add banner
   - [ ] Don't feature it (link in nav is enough)

4. **Back navigation**: Should logo/close button go to:
   - [ ] Main portfolio root `/`
   - [ ] Home page `/explorea/`
   - [ ] Previous page (browser back)

---

**Ready to proceed?** Reply with answers to the 4 questions above, and I can start Phase 1! 🚀
