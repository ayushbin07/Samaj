# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** VideoTube
**Generated:** 2026-09-29 01:28:55
**Category:** Video Streaming/OTT

---

## Global Rules

### Color Palette (Obsidian + Champagne + Cinematic Dark)

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#09090B` | `--color-bg` |
| Surface | `#111113` | `--color-surface` |
| Elevated Surface | `#18181B` | `--color-surface-2` |
| Surface Hover | `#202023` | `--color-surface-hover` |
| Border | `#27272A` | `--color-border` |
| Primary Text | `#F5F5F4` | `--color-text-primary` |
| Secondary Text | `#A1A1AA` | `--color-text-secondary` |
| Muted Text | `#71717A` | `--color-text-tertiary` |
| Primary Accent | `#E7B873` | `--color-accent` |
| Accent Hover | `#F0C98A` | `--color-accent-hover` |
| Accent Soft | `#E7B8731A` | `--color-accent-soft` |
| Accent Foreground | `#09090B` | `--color-accent-foreground` |
| Danger | `#EF4444` | `--color-danger` |
| Success | `#34D399` | `--color-success` |
| Info | `#60A5FA` | `--color-info` |

**Color Notes:** Obsidian + Champagne + Cinematic Dark

### Rounded Design Language & Radius Hierarchy

Soft, rounded, tactile, premium. Use HeroUI's most rounded options (`radius="full"` / `radius="lg"`).

- **Small controls (Highly rounded / Pill)**:
  - buttons: `rounded-full`
  - chips: `rounded-full`
  - badges: `rounded-full`
  - inputs & search: `rounded-full`
  - tabs: `rounded-full`
- **Medium surfaces (Generously rounded)**:
  - video cards: `rounded-2xl`
  - creator cards: `rounded-2xl`
  - tweet cards: `rounded-2xl`
  - dropdowns: `rounded-2xl`
  - menus: `rounded-2xl`
- **Large surfaces (Large rounded corners)**:
  - dialogs: `rounded-3xl`
  - video player containers: `rounded-3xl`
  - channel headers: `rounded-3xl`
  - major content panels: `rounded-3xl`
- **Pills**:
  - filters, tags, status badges, compact actions, category selectors: `rounded-full`

### Typography

- **Heading Font:** Inter / Outfit
- **Body Font:** Inter
- **Mood:** cinematic, dark, warm, minimal, rounded, refined, content-focused

### Shadow Depths
Use depth sparingly. Subtle borders (`#27272A`), slight surface contrast (`#09090B` vs `#111113` vs `#18181B`), restrained shadows. Avoid glowing cards everywhere.

---

## Component Specs

### Buttons
- Prefer rounded / pill (`rounded-full`)
- Avoid sharp rectangular buttons
- Primary action: champagne `#E7B873` with `#09090B` high-contrast text.

### Cards
- Generous rounded corners (`rounded-2xl`)
- Normal surface `#111113`, subtle border `#27272A`, hover `#202023`.

### Inputs
- Highly rounded (`rounded-full`), `#18181B` background, `#27272A` border, `#E7B873` focus ring.

### Media & Player
- Rounded video thumbnails (`rounded-xl` inside `rounded-2xl` card) and player container (`rounded-3xl`).

---

## Style Guidelines

**Style:** Dark Mode (OLED)

**Keywords:** Dark theme, low light, high contrast, deep black, midnight blue, eye-friendly, OLED, night mode, power efficient

**Best For:** Night-mode apps, coding platforms, entertainment, eye-strain prevention, OLED devices, low-light

**Key Effects:** Minimal glow (text-shadow: 0 0 10px), dark-to-light transitions, low white emission, high readability, visible focus

### Page Pattern

**Pattern Name:** Hero-Centric Design

- **Conversion Strategy:** One primary CTA. Let the hero dominate the initial viewport without hiding the next content cue. Use a static hero and non-pulsing CTA when reduced motion is requested; provide video controls. Pause hero media offscreen/hidden and keep the final hero message and CTA static under reduced motion.
- **CTA Placement:** Hero dominant (center/bottom) + Sticky nav CTA
- **Section Order:** Full-bleed Hero (headline + visual) > Single value prop strip > Key benefit or proof > Primary CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Static layout
- ❌ Slow video player

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
