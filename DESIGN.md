# HAOS — Design System

The Heebee luxury UI design language. Apple-inspired. Glass morphism. Apply to every screen.

---

## Typography

**Hero / asset names / numbers in dashboard tiles**
- Font: `Nunito Sans`, weight **200**
- Tracking: `-0.02em`
- Size: clamp(2.5rem, 6vw, 4rem) for hero, 2rem for tile values

**Body / labels / form inputs**
- Font: `Nunito Sans`, weight **300** (body) / **400** (input values)
- Size: 0.95rem body, 0.85rem labels (uppercase, tracking 0.08em)

**Buttons / CTAs**
- Font: `Nunito Sans`, weight **600**
- Tracking: 0.02em

**Codes / timers / monospace numbers (asset codes, dates, repair IDs)**
- Font: `Space Mono`, weight **400**
- Tracking: 0

**Root font size:** `html { font-size: 115%; }` — slightly enlarged for breathing room

---

## Colors

### Light theme (Owner / Manager dashboards)
```css
--bg: #f5f5f7;
--bg-elev: #ffffff;
--text: #1d1d1f;
--text-secondary: #6e6e73;
--border: rgba(0, 0, 0, 0.10);
--accent: #0a0a0f;             /* deep ink — buttons, highlights */
--success: #34c759;
--warning: #ff9500;
--danger:  #ff3b30;
```

### Dark theme (Repair workflow / late-night use)
```css
--bg: #0a0a0f;
--bg-elev: #18181f;
--text: #f5f5f7;
--text-secondary: #a1a1a6;
--border: rgba(255, 255, 255, 0.10);
--accent: #f5f5f7;
--success: #30d158;
--warning: #ff9f0a;
--danger:  #ff453a;
```

### Hero gradients
**Warm (Owner / login):**
`linear-gradient(135deg, #fef3e7 0%, #fae5d3 50%, #f5d4b8 100%)`

**Cool (Manager / dark):**
`linear-gradient(135deg, #1a1a24 0%, #14141c 50%, #0a0a0f 100%)`

---

## Glass morphism (the signature surface)

```css
.glass {
  background: rgba(255, 255, 255, 0.6);    /* light */
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid var(--border);
  border-radius: 20px;
}

[data-theme="dark"] .glass {
  background: rgba(24, 24, 31, 0.6);
}
```

Use for: cards, modals, dropdowns, toolbar, side panels.

⚠️ **Note:** `backdrop-filter` breaks inside claude.ai artifact preview. Renders fine on Safari/Chrome/PWA. Don't worry if preview looks flat — production is correct.

---

## Ambient background

Every screen has subtle depth — never flat solid color.

```html
<!-- Sit these as fixed siblings of <main>, behind everything -->
<div class="ambient-orb" style="top: 10%; left: 5%;"></div>
<div class="ambient-orb" style="bottom: 15%; right: 10%;"></div>
<div class="noise-overlay"></div>
```

```css
.ambient-orb {
  position: fixed;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 200, 150, 0.3), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.noise-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,...");  /* SVG noise */
}

main, .glass { position: relative; z-index: 2; }
```

---

## Buttons

```css
.btn {
  font-family: 'Nunito Sans';
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.85rem 1.5rem;
  border-radius: 999px;          /* pill */
  border: 1px solid var(--border);
  background: var(--accent);
  color: var(--bg);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.btn-secondary {
  background: transparent;
  color: var(--text);
}

.btn-danger {
  background: var(--danger);
}
```

---

## Inputs

```css
.input {
  font-family: 'Nunito Sans';
  font-weight: 400;
  font-size: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text);
  width: 100%;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--text);
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: block;
}
```

---

## PIN input pattern (login)

4 separate boxes. Auto-advance on type. Auto-submit on 4th digit. Backspace moves left.

Use the same exact code as Heebee Shift System v3.

---

## Layout rhythm

- Page padding: `clamp(1rem, 4vw, 2rem)`
- Card padding: `1.5rem` to `2rem`
- Vertical spacing between sections: `2rem`
- Grid gap: `1rem` mobile, `1.5rem` desktop
- Max content width: `1200px`, centered

---

## Animations

```css
* {
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-up { animation: fade-up 0.4s ease-out both; }
```

Stagger children with `animation-delay: calc(var(--i) * 0.05s);`

---

## Theme toggle

Sits top-right. Sun ↔ moon icon. Stores choice in `localStorage` as `hb_haos_theme`.

```js
document.documentElement.setAttribute('data-theme', 'dark' | 'light');
```

CSS uses `[data-theme="dark"] { ... }` to override the `:root` light defaults.

---

## Don'ts

- ❌ No drop shadows on text
- ❌ No `border-radius` < 12px on cards (looks cheap)
- ❌ No filled-color buttons that aren't `--accent` or `--danger`
- ❌ No multi-color UI — stick to grayscale + one warm accent at a time
- ❌ No sans-serif other than Nunito Sans + Space Mono
- ❌ No emojis in production UI (only allowed: status dots, meaningful icons)
- ❌ No bullet lists inside glass cards — use spacing + dividers

---

## Reference

This system is extracted from Heebee Shift System v3 (live in production). Stay consistent — the goal is users opening HAOS feeling it's the same family of products as the shift app.
