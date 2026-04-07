# Explorea v2 — Architectural Code Improvements

**Date**: 2026-03-27
**File**: `explorea_v2.html` (6,669 lines)
**Status**: 26 diagrams, working navigation, no breaking changes required

---

## Overview

This document outlines 10 architectural improvements to reduce code duplication, improve maintainability, and simplify future diagram additions. **All suggestions preserve existing functionality and navigation.**

Estimated effort: **Low to medium** (implement in phases). **Impact: High** (30-40% code reduction potential).

---

## 1. Global State Fragmentation → Unified AppState

**Priority**: 🔴 HIGH
**Effort**: 1-2 hours
**Impact**: Simplifies all view-switching logic

### Problem
State is scattered across multiple `window.*` variables:
```javascript
window._lensView = 'convex'  // Lens state
window._cmView = 'c2'         // Concave mirror state
window._prismView = 'dispersion'  // Prism state
window._heroAtom // Hero animation instance
```

Each diagram function manually initializes and checks these globals scattered throughout the code.

### Solution
```javascript
// Top of script, after opening <script> tag:
const AppState = {
  currentDiagram: null,      // 'atom', 'heart', 'lens', 'mirror', etc.
  currentZoom: 100,
  viewOptions: {},           // {atom: 'na_neutral', lens: 'convex', mirror: 'c2'}
  activeLayer: 'all',

  setView(diagramId, viewId) {
    if (!this.viewOptions[diagramId]) {
      this.viewOptions[diagramId] = {};
    }
    this.viewOptions[diagramId].active = viewId;
  },

  getView(diagramId) {
    return this.viewOptions[diagramId]?.active || 'default';
  }
};
```

**Usage in diagram functions:**
```javascript
// OLD:
function lensSetView(v) {
  window._lensView = v;
  document.getElementById('diag-area').innerHTML = refractionSVG();
  setTimeout(updateZoom,30);
  buildLayers(DATA.refraction.layers);
}

// NEW:
function lensSetView(v) {
  AppState.setView('lens', v);
  document.getElementById('diag-area').innerHTML = refractionSVG();
  setTimeout(updateZoom,30);
  buildLayers(DATA.refraction.layers);
}

// And in the SVG function:
function prismLightSVG() {
  const currentView = AppState.getView('prism') || 'dispersion';
  return currentView === 'recombine' ? prismRecombineSVG() : prismDispersionSVG();
}
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easier to debug state issues
- ✅ Natural extension point for localStorage (persist user's last viewed state)
- ✅ Cleaner state access across all 26 diagrams

---

## 2. Color Palette Duplication → Centralized COLORS Object

**Priority**: 🟡 MEDIUM
**Effort**: 30-45 minutes
**Impact**: Single-point design changes

### Problem
Colors hardcoded in 50+ places throughout SVG templates:
```javascript
fill="#2D7D5A"    // Accent green — appears ~15 times
fill="#C84828"    // Accent red — appears ~20 times
fill="#3B6FBD"    // Accent blue — appears ~18 times
fill="#E6F4EE"    // Accent bg green — appears ~12 times
```

If design requires a color change, you must find/replace everywhere.

### Solution
```javascript
// After AppState, add at top of script:
const COLORS = {
  // Primary palette
  accent: '#2D7D5A',      // Sage green
  accentDark: '#1F5E42',
  accentBg: '#E6F4EE',

  // Accent variants
  red: '#C84828',
  redDark: '#6A0A0A',
  redBg: '#FEF0ED',
  orange: '#E88020',
  orangeBg: '#FEF5E8',

  blue: '#3B6FBD',
  blueDark: '#185FA5',
  blueBg: '#EEF3FA',

  // Neutrals
  ink: '#1A1916',
  ink2: '#4A4843',
  ink3: '#7A7670',
  ink4: '#B0ACA6',
  bg: '#F4F1EB',
  bg2: '#EDEAE3',
  bg3: '#E4E0D6',
  white: '#FDFCF9',

  // Biology specifics
  biology: '#2D7D5A',
  chemistry: '#2D7D5A',
  physics: '#3C3489',

  // SVG gradients
  nucleus: {start: '#E86040', mid: '#C8481E', end: '#943418'},
  electron: {start: '#4AAD7A', end: '#2D7D5A'}
};
```

**Replace hardcoded colors:**
```javascript
// OLD:
<circle cx="45" cy="45" r="9" fill="#C8481E" opacity=".85"/>
<ellipse cx="45" cy="45" rx="32" ry="12" fill="none" stroke="#2D7D5A" stroke-width="1.2"/>

// NEW:
<circle cx="45" cy="45" r="9" fill="${COLORS.red}" opacity=".85"/>
<ellipse cx="45" cy="45" rx="32" ry="12" fill="none" stroke="${COLORS.accent}"/>
```

**Benefits:**
- ✅ Change all accent colors in one place
- ✅ Consistent naming (no more guessing hex values)
- ✅ Easy to create color variants (light/dark modes)
- ✅ Self-documenting intent (e.g., `COLORS.biology` vs `#2D7D5A`)

---

## 3. Monolithic SVG Generation → Utility Library

**Priority**: 🔴 HIGH
**Effort**: 2-3 hours
**Impact**: 30-40% code reduction, easier to maintain

### Problem
Each diagram function is 100-300 lines of template literals with massive duplication:
- **atom.js SVG**: Contains `atomNucleus()`, electrons, shells, label chips, config badges (repeated in `atomNaSVG()`, `atomNaPlusSVG()`)
- **heart.js SVG**: Repeated path definitions for each chamber structure
- **brain.js SVG**: Duplicated lobe path definitions with minor tweaks

### Solution
Create a modular SVG builder library:

```javascript
// ══════════════════════════════════════════════════════════════
// SVG COMPONENT LIBRARY
// ══════════════════════════════════════════════════════════════

const SVGLib = {
  // ─── DEFS ───
  defs: (items = []) => {
    let defsStr = '<defs>';
    if (items.includes('radialGradients')) {
      defsStr += `
        <radialGradient id="ng" cx="42%" cy="38%" r="58%">
          <stop offset="0%" stop-color="${COLORS.nucleus.start}"/>
          <stop offset="60%" stop-color="${COLORS.nucleus.mid}"/>
          <stop offset="100%" stop-color="${COLORS.nucleus.end}"/>
        </radialGradient>
        <radialGradient id="eg" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stop-color="${COLORS.electron.start}"/>
          <stop offset="100%" stop-color="${COLORS.electron.end}"/>
        </radialGradient>`;
    }
    defsStr += '</defs>';
    return defsStr;
  },

  // ─── ATOMIC STRUCTURES ───
  nucleus: (cx, cy, label, protons, neutrons) => `
    <circle cx="${cx}" cy="${cy}" r="18" fill="url(#ng)"/>
    <circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke="white" stroke-width="0.5" opacity=".4"/>
    <text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="12" fill="white" font-weight="700">${label}</text>
    <g class="layer-nucleus">
      ${Array.from({length: protons}, (_, i) => {
        const angle = (i * 360 / protons) * Math.PI / 180;
        const x = cx + 10 * Math.cos(angle);
        const y = cy + 10 * Math.sin(angle);
        return `<circle cx="${x}" cy="${y}" r="2.5" fill="white"/>`;
      }).join('')}
    </g>`,

  electron: (cx, cy, r = 7, className = '') =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#eg)" ${className ? `class="${className}"` : ''}/>'`,

  electronShell: (cx, cy, radius, count, className = 'layer-orbits') => {
    const points = Array.from({length: count}, (_, i) => {
      const angle = (i * 360 / count) * Math.PI / 180;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });
    return `<g class="${className}">
      ${points.map(p => SVGLib.electron(p.x, p.y)).join('')}
    </g>`;
  },

  // ─── DIAGRAM ELEMENTS ───
  labelChip: (cx, cy, title, facts, factIndex = 0) => `
    <g class="lchip" onclick="showTip(event,'${title}',${JSON.stringify(facts)},${factIndex})">
      <circle cx="${cx}" cy="${cy}" r="3.5" fill="${COLORS.accent}"/>
      <line x1="${cx+4}" y1="${cy}" x2="370" y2="${cy}" stroke="${COLORS.ink4}" stroke-width="0.8"/>
      <rect x="370" y="${cy-12}" width="146" height="24" rx="6" fill="${COLORS.white}"
            stroke="${COLORS.ink4}" stroke-width="0.8"/>
      <text x="443" y="${cy+4}" text-anchor="middle" font-size="11" fill="${COLORS.ink}"
            font-weight="600">${title}</text>
    </g>`,

  configBadge: (cx, cy, text, color = 'green') => `
    <rect x="${cx-42}" y="${cy-28}" width="84" height="18" rx="5"
          fill="${color === 'green' ? COLORS.accentBg : COLORS.redBg}"/>
    <text x="${cx}" y="${cy-14}" text-anchor="middle" font-size="10"
          fill="${color === 'green' ? COLORS.accentDark : COLORS.red}"
          font-weight="600">${text}</text>`,

  // ─── COMMON SHAPES ───
  arrow: (x1, y1, x2, y2, color = COLORS.red, label = '') => `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="${x2},${y2-8} ${x2-7},${y2+8} ${x2+7},${y2+8}" fill="${color}"/>
    ${label ? `<text x="${(x1+x2)/2}" y="${(y1+y2)/2-10}" text-anchor="middle" font-size="10" fill="${color}">${label}</text>` : ''}`,

  heartChamber: (cx, cy, rx, ry, label, color = COLORS.red) => `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" opacity=".7" stroke="${COLORS.ink2}" stroke-width="1.5"/>
    <text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="10" fill="${COLORS.ink}" font-weight="600">${label}</text>`,

  // ─── CONTAINER TEMPLATES ───
  wrapSVG: (viewBox, content, title = '', subtitle = '') => `
    <svg viewBox="${viewBox}" font-family="'DM Sans',sans-serif">
      ${title ? `<text x="${viewBox.split(' ')[2]/2}" y="22" text-anchor="middle" font-size="13" fill="${COLORS.ink}" font-weight="600">${title}</text>` : ''}
      ${subtitle ? `<text x="${viewBox.split(' ')[2]/2}" y="38" text-anchor="middle" font-size="10.5" fill="${COLORS.ink3}">${subtitle}</text>` : ''}
      ${content}
    </svg>`
};
```

**Example usage — rewrite atom SVG:**
```javascript
// OLD: 50+ lines of SVG building nucleus, electrons, shells, labels manually
function atomSVG() {
  const cx=260, cy=282;
  return `<svg viewBox="0 0 520 560" width="520" height="560" font-family="'DM Sans',sans-serif">
    ${SVGLib.defs(['radialGradients'])}
    ${SVGLib.nucleus(cx, cy, 'Na', 11, 12)}
    ${SVGLib.electronShell(cx, cy, 82, 2)}
    ${SVGLib.electronShell(cx, cy, 148, 8)}
    ${SVGLib.electronShell(cx, cy, 210, 1)}
    ${SVGLib.configBadge(cx, cy-72, 'config: 2, 8, 1')}
    <g class="layer-labels">
      ${SVGLib.labelChip(cx-32, cy, 'Atomic number (Z)', ['= protons in nucleus', ...], 0)}
      ${SVGLib.labelChip(cx-32, cy+30, 'Mass number (A)', ['= protons + neutrons', ...], 1)}
    </g>
  </svg>`;
}

// Now much cleaner! And nucleus/electron logic is DRY.
```

**Benefits:**
- ✅ ~50+ lines removed per diagram
- ✅ Consistent SVG component styling across all 26 diagrams
- ✅ Single place to tweak nucleus appearance, electron styling
- ✅ Easy to add new components (mirror shapes, organ outlines, etc.)
- ✅ Better code reuse (heart chambers, brain lobes can use `configBadge`)

---

## 4. Scattered Helper Functions → Namespaced DiagramHelpers

**Priority**: 🟡 MEDIUM
**Effort**: 30 minutes
**Impact**: Better code organization, easier discovery

### Problem
Helper functions exist but aren't grouped:
```javascript
function _mirrorBase(type) { /* ... */ }
function _objArrow(x, y, label) { /* ... */ }
function _resultBox(y, color, text1, text2) { /* ... */ }
function _cmFCLabels(highlight) { /* ... */ }
```

New developers don't know these exist or where to find them.

### Solution
```javascript
// ══════════════════════════════════════════════════════════════
// DIAGRAM HELPER FUNCTIONS (organized by diagram type)
// ══════════════════════════════════════════════════════════════

const DiagramHelpers = {
  // ─── MIRROR HELPERS ───
  mirrorBase: (type) => {
    // Original _mirrorBase logic
  },

  mirrorFCLabels: (highlight = '') => {
    // Original _cmFCLabels logic
  },

  objArrow: (x, y, label = 'Object') => {
    // Original _objArrow logic
  },

  realImgArrow: (x, y, label = 'Image') => {
    // Original _realImgArrow logic
  },

  resultBox: (y, color, text1, text2) => {
    // Original _resultBox logic
  },

  // ─── ATOM HELPERS ───
  atomNucleus: (cx, cy, label, protons, neutrons) => {
    // Original atomNucleus logic
  },

  atomToggleBar: (active) => {
    // Original atomToggleBar logic
  },

  // ─── LENS HELPERS ───
  lensToggleBar: (active) => {
    // Original lensToggleBar logic
  }
};
```

**Usage:**
```javascript
// OLD:
${_mirrorBase('concave')}${_cmFCLabels('')}${_objArrow(80,155,'Object')}

// NEW:
${DiagramHelpers.mirrorBase('concave')}${DiagramHelpers.mirrorFCLabels()}${DiagramHelpers.objArrow(80, 155)}
```

**Benefits:**
- ✅ Clear organization: helpers grouped by diagram type
- ✅ Self-documenting (function name tells you what it does)
- ✅ Easy to find across all diagrams
- ✅ Easier to add new diagrams (copy similar helpers)

---

## 5. Checkbox/Inline Event Handlers → Centralized Event Delegation

**Priority**: 🟢 LOW (optional)
**Effort**: 1-1.5 hours
**Impact**: Cleaner HTML, easier to add analytics/logging

### Problem
26+ inline `onclick="..."` handlers scattered throughout HTML:
```html
<div class="ftag on" onclick="filterTag(this,'all')" aria-pressed="true">All</div>
<div class="dcard" role="listitem" data-cat="chemistry" onclick="openDiagram('atom')">
<div class="ltog on" onclick="toggleLayer(this,'labels')"></div>
```

Hard to add logging, A/B testing, or keyboard shortcuts without editing 26 places.

### Solution
```javascript
// ══════════════════════════════════════════════════════════════
// CENTRALIZED EVENT DELEGATION
// ══════════════════════════════════════════════════════════════

document.addEventListener('click', (e) => {
  // Filter tags (Biology, Chemistry, etc.)
  if (e.target.matches('.ftag')) {
    const tag = e.target.dataset.filter;
    filterTag(e.target, tag);
    return;
  }

  // Diagram cards (click to open)
  const dcard = e.target.closest('.dcard');
  if (dcard) {
    openDiagram(dcard.dataset.id);
    return;
  }

  // Layer toggles
  if (e.target.matches('.ltog')) {
    const layer = e.target.dataset.layer;
    const diagram = e.target.dataset.diagram;
    toggleLayer(e.target, layer, diagram);
    return;
  }

  // Diagram view switches (lens convex/concave, mirror cases, etc.)
  if (e.target.matches('[data-view-switch]')) {
    const diagram = e.target.dataset.diagram;
    const view = e.target.dataset.view;
    setDiagramView(diagram, view);
    return;
  }

  // Organ clicks (digestive system glow)
  if (e.target.matches('[data-organ]')) {
    const organic = e.target.dataset.organ;
    glowOrgan(e.target.id);
    const stepIdx = e.target.dataset.step || 0;
    goStep(parseInt(stepIdx));
    return;
  }
});

// Add logging/analytics wrapper (optional):
function trackEvent(category, action, label) {
  console.log(`📊 ${category} > ${action}: ${label}`);
  // Add GA4, Mixpanel, etc. here
}
```

**Update HTML (data attributes instead of onclick):**
```html
<!-- OLD -->
<div class="ftag on" onclick="filterTag(this,'all')">All</div>

<!-- NEW -->
<div class="ftag on" data-filter="all" role="button" aria-pressed="true">All</div>

<!-- OLD -->
<div class="dcard" role="listitem" data-cat="chemistry" onclick="openDiagram('atom')">

<!-- NEW -->
<div class="dcard" role="listitem" data-cat="chemistry" data-id="atom">

<!-- OLD -->
<div class="ltog on" onclick="toggleLayer(this,'labels')">Labels</div>

<!-- NEW -->
<div class="ltog on" data-layer="labels" data-diagram="atom">Labels</div>
```

**Benefits:**
- ✅ Simpler HTML (no inline JS)
- ✅ Add logging in one place, applies everywhere
- ✅ Easier to add keyboard shortcuts
- ✅ Better for security (Content Security Policy compliance)

---

## 6. Magic Numbers in SVG → Centralized Configuration

**Priority**: 🟢 LOW
**Effort**: 45 minutes
**Impact**: Easier diagram resizing, responsive tweaks

### Problem
SVG dimensions scattered everywhere:
```javascript
function atomSVG() {
  return `<svg viewBox="0 0 520 560" width="520" height="560">...`;
}
function heartSVG() {
  return `<svg viewBox="0 0 520 620" width="520" height="620">...`;
}
```

Hard to batch-adjust sizes or make responsive without finding each one.

### Solution
```javascript
const SVG_CONFIG = {
  atom: {
    viewBox: '0 0 520 560',
    width: 520,
    height: 560,
    centerX: 260,
    centerY: 282
  },
  heart: {
    viewBox: '0 0 520 620',
    width: 520,
    height: 620,
    centerX: 260,
    centerY: 310
  },
  brain: {
    viewBox: '0 0 700 520',
    width: 700,
    height: 520,
    centerX: 350,
    centerY: 260
  },
  // ... all 26 diagrams
};

// Usage:
function atomSVG() {
  const cfg = SVG_CONFIG.atom;
  return `<svg viewBox="${cfg.viewBox}" width="${cfg.width}" height="${cfg.height}">...`;
}

// Easy responsive adjustment:
const mobile = window.innerWidth < 768;
const scale = mobile ? 0.8 : 1;
const cfg = { ...SVG_CONFIG.atom, width: SVG_CONFIG.atom.width * scale };
```

**Benefits:**
- ✅ Resize all diagrams in one place
- ✅ Easy mobile/responsive tweaks
- ✅ Centers and dimensions in one lookup

---

## 7. Layer Toggle Code Pattern → Unified Builder

**Priority**: 🟡 MEDIUM
**Effort**: 1 hour
**Impact**: ~50 lines removed, consistency

### Problem
Multiple layer bar builders doing nearly identical things:
```javascript
function atomToggleBar(active) { /* ... */ }
function lensToggleBar(active) { /* ... */ }
function mirrorToggleBar() { /* build all 6 cases */ }
```

Each reimplements the same grid layout, click handlers, active states.

### Solution
```javascript
// ══════════════════════════════════════════════════════════════
// UNIFIED LAYER & VIEW BUILDER
// ══════════════════════════════════════════════════════════════

function buildLayerBar(diagramId, layers = [], variants = []) {
  const el = document.getElementById('layer-btns');
  if (!el) return;

  let html = layers.map(l =>
    `<div class="ltog on" data-layer="${l.toLowerCase()}" data-diagram="${diagramId}">${l}</div>`
  ).join('');

  if (variants.length > 0) {
    html += `<div class="ltog-sep"></div>`;
    variants.forEach(v => {
      const isActive = AppState.getView(diagramId) === v.id;
      html += `<div class="ltog${isActive ? ' on' : ''}"
                data-view-switch data-diagram="${diagramId}" data-view="${v.id}">${v.label}</div>`;
    });
  }

  el.innerHTML = html;
}

// Usage in diagram functions:
// Simple (only layers):
function atomSetView() {
  AppState.setView('atom', 'neutral');
  buildLayerBar('atom', DATA.atom.layers);
}

// With variants (lens/mirror):
function lensSetView(v) {
  AppState.setView('lens', v);
  buildLayerBar('lens', DATA.refraction.layers, [
    {id: 'convex', label: 'Convex lens'},
    {id: 'concave', label: 'Concave lens'}
  ]);
}

function mirrorSetView(v) {
  AppState.setView('mirror', v);
  buildLayerBar('mirror', DATA.concave_mirror.layers, [
    {id: 'c1', label: 'Object at ∞'},
    {id: 'c2', label: 'Beyond C'},
    {id: 'c3', label: 'At C'},
    {id: 'c4', label: 'Between C & F'},
    {id: 'c5', label: 'At F'},
    {id: 'c6', label: 'Between F & P'}
  ]);
}
```

**Benefits:**
- ✅ ~50 lines of code removed
- ✅ Consistent styling and behavior across all diagrams
- ✅ Single place to tweak layout (grid, spacing, colors)
- ✅ Easier to add new diagrams

---

## 8. Inconsistent Naming Conventions

**Priority**: 🟢 LOW
**Effort**: 1-1.5 hours
**Impact**: Code clarity, easier navigation

### Problem
Mix of naming styles and lack of function prefixes:
```javascript
openDiagram()           // camelCase: fine
glowOrgan()             // camelCase: fine
_resultBox()            // _prefix: inconsistent
atomToggleBar()         // Not clearly a toggle bar
lensToggleBar()         // Not clearly a toggle bar
atomNaSVG()             // What's "Na"? Sodium, but unclear if you don't know chemistry
```

### Solution
Adopt consistent prefixes and naming:
```javascript
// ─── OPENING/CLOSING ───
openDiagram(id)         // ✅ Clear
closeViewer()           // ✅ Clear
showTip(event, title, facts)  // ✅ Clear
closeTip()

// ─── DIAGRAMS ─── (prefix with diagram type or keep short)
// Option A: prefix + action
diagram_atom_render()
diagram_heart_render()
diagram_lens_render()

// Option B: namespace object (recommended)
const Diagrams = {
  atom: {
    render: () => { /* ... */ },
    setView: (v) => { /* ... */ },
    layers: ['Labels', 'Orbits', 'Charges']
  },
  heart: { /* ... */ }
};

// ─── HELPERS ─── (already covered in #4: DiagramHelpers)
DiagramHelpers.resultBox()
DiagramHelpers.objArrow()

// ─── UTILITIES ─── (clear prefixes)
updateZoom()            // ✅ Clear
filterTag(tag)          // ✅ Clear
toggleLayer(layer)      // ✅ Clear
```

**Search-and-replace map:**
```
atomNaSVG()         → Diagrams.atom.svgNeutral() or atomSVG('neutral')
atomNaPlusSVG()     → Diagrams.atom.svgIon() or atomSVG('ion')
cm1, cm2, ... cm6   → Diagrams.mirror.svg(caseNumber) or mirrorSVG('c1'), etc.
_resultBox()        → DiagramHelpers.resultBox()
_mirrorBase()       → DiagramHelpers.mirrorBase()
```

**Benefits:**
- ✅ Clearer intent (functions are self-documenting)
- ✅ Easier to grep/search for related functions
- ✅ Prepares you for modularization (eventual imports)

---

## 9. Filter Logic Tightly Coupled → Explicit State Management

**Priority**: 🟡 MEDIUM
**Effort**: 45 minutes
**Impact**: Easier to persist filters, test logic

### Problem
`filterTag()` directly manipulates DOM; filter state is implicit:
```javascript
function filterTag(elem, tag) {
  // Toggle 'on' class on clicked tag
  document.querySelectorAll('.ftag').forEach(e => e.classList.remove('on'));
  elem.classList.add('on');

  // Hide/show cards by cat
  document.querySelectorAll('.dcard').forEach(card => {
    if (tag === 'all' || card.dataset.cat === tag) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}
```

No way to know current filter state without reading DOM. Hard to persist across reloads.

### Solution
```javascript
const SearchState = {
  filter: 'all',
  query: '',

  // Setters
  setFilter(tag) {
    this.filter = tag;
    this.render();
    this.persist();  // Save to localStorage
  },

  setQuery(q) {
    this.query = q.toLowerCase().trim();
    this.render();
  },

  // Rendering logic
  render() {
    const cards = document.querySelectorAll('.dcard');
    cards.forEach(card => {
      const cat = card.dataset.cat;
      const title = card.querySelector('.dtitle').textContent.toLowerCase();

      // Show if matches both filter AND search
      const passesFilter = this.filter === 'all' || cat === this.filter;
      const passesSearch = this.query === '' || title.includes(this.query);
      const show = passesFilter && passesSearch;

      card.style.display = show ? '' : 'none';
    });

    // Update active filter button
    document.querySelectorAll('.ftag').forEach(ftag => {
      ftag.classList.toggle('on', ftag.dataset.filter === this.filter);
    });
  },

  // Persistence
  persist() {
    localStorage.setItem('searchState', JSON.stringify({
      filter: this.filter,
      query: this.query
    }));
  },

  restore() {
    const saved = localStorage.getItem('searchState');
    if (saved) {
      const state = JSON.parse(saved);
      this.filter = state.filter;
      this.query = state.query;
      this.render();
    }
  }
};

// On page load:
document.addEventListener('DOMContentLoaded', () => {
  SearchState.restore();
});

// Event handlers (via delegation):
// (Already set up in #5)
function handleFilterClick(tag) {
  SearchState.setFilter(tag);
}

function handleSearch() {
  const query = document.getElementById('sq').value;
  SearchState.setQuery(query);
}
```

**Benefits:**
- ✅ Explicit state (always know current filter/query)
- ✅ Persists across page reloads (localStorage)
- ✅ Testable logic (logic is separate from DOM)
- ✅ Easy to add "saved filters" or export search results

---

## 10. Add Architectural Comments for Maintainers ⭐

**Priority**: 🔴 HIGH (Quick Win!)
**Effort**: 15-20 minutes
**Impact**: Immediate onboarding value

### Problem
26 diagrams, complex state, view transitions—no comments explaining the architecture.

### Solution
Add clear comments at key points:

```javascript
// ══════════════════════════════════════════════════════════════
// EXPLOREA v2 — INTERACTIVE SCIENCE DIAGRAMS
// ══════════════════════════════════════════════════════════════
// 26 NCERT-aligned diagrams: atomic structure, biology systems, optics, mechanics
//
// ARCHITECTURE:
// 1. Home view (hero + search + grid) → Home state
// 2. Click diagram card → Viewer state (full-screen SVG + side panel)
// 3. Close viewer → Back to Home
//
// STATE MANAGEMENT:
// - AppState: current diagram, zoom, view options (e.g., lens convex/concave)
// - SearchState: filter, query, filtered card visibility
// - Each diagram has optional view variants (lens, mirror have 2/6 views)
//
// RENDERING:
// - SVGLib: reusable components (nucleus, shells, label chips, arrows, etc.)
// - Diagrams object: organized by type, each with layers/variants
// - Each diagram SVG is function() → string interpolation (performant)
//
// EVENT DELEGATION:
// - Top-level click handler routes to appropriate function
// - No inline onclick="" handlers (see #5)
// ══════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
// CONSTANTS & UTILITIES
// ──────────────────────────────────────────────────────────────

const COLORS = { /* ... */ };
const SVG_CONFIG = { /* ... */ };
const AppState = { /* ... */ };
const SearchState = { /* ... */ };
const SVGLib = { /* ... */ };
const DiagramHelpers = { /* ... */ };

// ──────────────────────────────────────────────────────────────
// DATA: Diagram definitions (steps, layers, metadata)
// ──────────────────────────────────────────────────────────────
// Each diagram has:
// - title: display name
// - meta: category + class info
// - layers: toggleable visual layers (e.g., ['Labels', 'Orbits', 'Charges'])
// - steps: in-side-panel explanations (clickable label chips link here)
// ──────────────────────────────────────────────────────────────

const DATA = {
  atom: { title: '...', meta: '...', layers: [...], steps: [...] },
  heart: { /* ... */ },
  // ... all 26 diagrams
};

// ──────────────────────────────────────────────────────────────
// DIAGRAM RENDERING: SVG generators by diagram ID
// ──────────────────────────────────────────────────────────────
// Each returns a string of SVG markup.
// Diagram functions check AppState to determine which view variant to render.
// ──────────────────────────────────────────────────────────────

function atomSVG() { /* ... */ }
function heartSVG() { /* ... */ }
// ... all 26

// ──────────────────────────────────────────────────────────────
// VIEWER CONTROL PANEL: Step selection + details
// ──────────────────────────────────────────────────────────────
// updateStep(stepIndex): Show title, details, facts in side panel
// goStep(idx): Click organ → jump to that step
// ──────────────────────────────────────────────────────────────

function updateStep(idx) { /* ... */ }
function goStep(idx) { /* ... */ }

// ──────────────────────────────────────────────────────────────
// LAYER MANAGEMENT: Show/hide SVG groups by class
// ──────────────────────────────────────────────────────────────
// toggleLayer(elem, layerName):
// - Find all .layer-${layerName} in current diagram
// - Toggle display:none
// ──────────────────────────────────────────────────────────────

function toggleLayer(elem, layer) { /* ... */ }
function buildLayers(layerList) { /* ... */ }

// ──────────────────────────────────────────────────────────────
// ZOOM HANDLING: Pan and scale the SVG viewport
// ──────────────────────────────────────────────────────────────
// Canvas uses CSS transform to scale from top-left corner.
// Pinch on mobile, +/− buttons on desktop.
// ──────────────────────────────────────────────────────────────

function zi() { /* zoom in */ }
function zo() { /* zoom out */ }
function updateZoom() { /* update scale transform + label */ }

// ──────────────────────────────────────────────────────────────
// TOOLTIP SYSTEM: Label chips show on click
// ──────────────────────────────────────────────────────────────
// showTip(event, title, facts[], factIndex):
// - Position tooltip near clicked element
// - Populate title + facts
// closeTip(): Hide tooltip
// ──────────────────────────────────────────────────────────────

function showTip(event, title, facts, idx = 0) { /* ... */ }
function closeTip() { /* ... */ }

// ──────────────────────────────────────────────────────────────
// NAVIGATION: View switching (home ↔ viewer) & diagram selection
// ──────────────────────────────────────────────────────────────
// openDiagram(id): Render SVG, load steps, switch to #viewer
// closeViewer(): Reset state, switch back to #home
// ──────────────────────────────────────────────────────────────

function openDiagram(id) { /* ... */ }
function closeViewer() { /* ... */ }

// ──────────────────────────────────────────────────────────────
// SEARCH & FILTER: Home page functionality
// ──────────────────────────────────────────────────────────────
// SearchState.setFilter(tag): Filter cards by biology/chemistry/physics
// SearchState.setQuery(q): Search diagram titles
// ──────────────────────────────────────────────────────────────

// (SearchState defined above)
function doSearch() { SearchState.setQuery(document.getElementById('sq').value); }
function filterTag(elem, tag) { SearchState.setFilter(tag); }

// ──────────────────────────────────────────────────────────────
// EVENT DELEGATION: Centralized click handling
// ──────────────────────────────────────────────────────────────

document.addEventListener('click', (e) => { /* ... */ });
```

**Benefits:**
- ✅ New developers understand architecture in 5 minutes
- ✅ Know where to add features (which function, which section)
- ✅ Explains the data flow (home → viewer → diagram → steps)
- ✅ Shows how each piece fits together

---

## Implementation Priority & Phasing

### Phase 1 (Quick wins, low risk)
1. ✅ **#10 Comments** (15 min) — Do this first
2. ✅ **#2 COLORS object** (30 min) — Find+replace all hex values
3. ✅ **#1 AppState** (1-2 hours) — Replace window._ globals

**Time**: ~2 hours | **Lines removed**: ~100-150 | **Risk**: Very low

### Phase 2 (Moderate refactoring)
4. ✅ **#7 Unified layer builder** (1 hour) — Consolidate toggle bars
5. ✅ **#4 DiagramHelpers namespace** (30 min) — Organize existing helpers
6. ✅ **#9 SearchState** (45 min) — Explicit filter management

**Time**: ~2.5 hours | **Lines removed**: ~150-200 | **Risk**: Low (helpers are self-contained)

### Phase 3 (Major refactoring, optional)
7. ✅ **#3 SVGLib components** (2-3 hours) — Extract nucleus, shells, chips, etc.
8. ✅ **#6 SVG_CONFIG** (45 min) — Centralize diagram dimensions
9. ✅ **#8 Naming conventions** (1-1.5 hours) — Consistent function names
10. ✅ **#5 Event delegation** (1-1.5 hours) — Remove onclick handlers

**Time**: ~6-7 hours | **Lines removed**: ~500+ | **Risk**: Moderate (test thoroughly after each change)

---

## Testing Checklist (After Each Phase)

- [ ] All 26 diagrams load and render
- [ ] Zoom in/out works on all diagrams
- [ ] Layer toggles switch visibility
- [ ] Diagram view switches work (lens: convex/concave, mirror: 6 cases, etc.)
- [ ] Search/filter responds to input
- [ ] Side panel steps click correctly
- [ ] Tooltips appear on label chip clicks
- [ ] Mobile responsive (hero collapses, grid adjusts)
- [ ] Hero atom animation plays
- [ ] Year updates in footer (JS works)

---

## Summary: Before & After

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of code** | ~6,669 | ~4,000–4,500 |
| **Color changes** | Find+replace 50+ places | Edit COLORS object (1 place) |
| **Add new diagram** | Copy entire diagram + helpers | Use SVGLib + Diagrams template |
| **State management** | Scattered window._ globals | Unified AppState |
| **Layer toggles** | 6 different implementations | 1 unified `buildLayerBar()` |
| **Layer duplicate** | 50+ lines (nucleus, shells, badges) | SVGLib components |
| **Onboarding time** | ~2 hours to understand flow | ~15-20 minutes (comments + structure) |

---

## Notes for Implementation

1. **Do not rush** — Implement one phase at a time
2. **Git commits** — Create a commit after each phase
3. **Test thoroughly** — Set up a testing checklist (see above)
4. **Gradual migration** — It's safe to mix old + new code during refactoring
5. **Backwards-compatible** — All changes preserve existing functionality
6. **Modularization** — After Phase 3, consider splitting into separate files (SVGLib.js, DiagramHelpers.js, SearchState.js)

---

**Last Updated**: 2026-03-27
**Status**: Ready for Phase 1 implementation
**Reviewer**: Architectural analysis complete ✅
