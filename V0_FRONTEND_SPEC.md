# InSilico — Frontend Spec for v0

## What This App Does

A web interface where users type or paste text, and the app returns a visualization of predicted brain activation — which regions of the brain respond to that input. Powered by TRIBE v2, a multimodal brain encoding model from Meta.

The user types a sentence. The app shows them a brain.

---

## Design Language

**Anthropic-style minimalism.** The aesthetic is: a research tool that feels like a luxury product.

- **Background:** Off-white / warm cream (`#F5F0E8` or similar parchment tone)
- **Text:** Near-black (`#1A1A1A`), high contrast, no gray-on-gray
- **Accent:** One single accent color — a muted warm tone. Desaturated terracotta (`#C4704B`) or soft gold (`#B8976A`). Used sparingly: one button, one highlight, nothing else.
- **Typography:** Serif headings (like Tiempos, Newsreader, or Source Serif Pro). Clean sans-serif body (Inter, Söhne, or system font stack). Large headings, generous line height.
- **Spacing:** Extremely generous whitespace. Content never touches edges. Let things breathe.
- **Borders:** Thin, light (`1px solid #E0DAD0`). No drop shadows. No gradients.
- **Corners:** Subtle rounding (`4-6px`), never pill-shaped.
- **Motion:** Minimal. Subtle fade-ins. No bouncing, no sliding, no parallax.
- **Overall feel:** The Anthropic website meets a scientific instrument. Quiet confidence.

---

## Pages / Views

### 1. Landing / Input Page

This is the main page. Almost everything happens here.

**Layout (top to bottom):**

```
[navbar]

                    [large heading]
                    [one-line subtitle]

              [text input area — large, centered]

                    [submit button]
```

**Navbar:**
- Left: "insilico" in lowercase, serif, medium weight
- Right: "About" and "GitHub" as simple text links
- Thin bottom border separating from content
- No logo graphic, just the wordmark

**Hero area:**
- Heading: "See what the brain hears." — large serif, ~48-56px, centered
- Subtitle: "Type anything. We'll show you which brain regions respond." — sans-serif, muted color (`#6B6459`), ~18px
- Lots of space between heading and input

**Text input:**
- A single large textarea, centered, ~600px wide
- Placeholder: "Type or paste text here..."
- Clean border, no background fill (or very subtle warm tint)
- Auto-grows with content, min-height ~120px
- Character count in bottom-right corner, muted text

**Submit button:**
- Below the textarea, centered
- Text: "Predict" or "Run"
- Filled with accent color, white text
- Subtle hover state (slightly darker)
- No icon needed

**Loading state:**
- The button text changes to "Predicting..." with a minimal spinner (thin circle, not a full loading animation)
- Or: a thin progress bar appears below the input, left to right, accent color
- The textarea stays visible and editable

---

### 2. Results View

Appears below the input after prediction completes. The input area stays at the top so users can immediately try another query. Results slide/fade in below.

**Layout:**

```
[input area stays at top, slightly compressed]

─────────────────────────────────────

[brain visualization — large, centered]

[ROI summary cards — horizontal row]

[raw values expandable section]
```

**Brain visualization:**
- The centerpiece. A high-quality rendering of the brain surface with activation overlaid as a heatmap.
- Show 4 views in a 2x2 grid: left lateral, right lateral, left medial, right medial
- Each view is a static image rendered by the backend (PNG)
- Clean labels below each: "Left lateral", "Right lateral", etc. — small, muted
- The colormap: a diverging warm palette (dark blue → white → dark red) on the cream background. Or a sequential warm palette (cream → terracotta → deep brown) for single-condition activations.
- A thin, elegant colorbar below the grid showing the scale

**ROI summary cards:**
- A horizontal row of 4-6 cards below the brain images
- Each card shows:
  - ROI name (e.g., "Broca's Area") — serif, medium
  - Anatomical label below in small muted text (e.g., "BA 45 — left inferior frontal")
  - Activation value — large number, accent color if high
  - A thin horizontal bar showing relative activation (like a mini progress bar)
- Cards have subtle borders, no shadows, same cream background
- Think of them like stat cards on a Bloomberg terminal but warm and human

**Expandable raw data:**
- A collapsible section: "View raw data →"
- When expanded, shows a clean table of all ROI values
- Option to download as CSV

---

### 3. About Page (Optional / Simple)

A single-scroll page with:
- What TRIBE v2 is (2-3 sentences)
- What "in-silico" means (one sentence)
- Link to the paper
- Link to the GitHub repo
- A note that this uses the "unseen subject" mode (group average, not individual)
- Credits

Same design language. Lots of whitespace. No cards or boxes — just text flowing down the page with generous margins.

---

## Components

### TextInput
- Large textarea with clean border
- Placeholder text
- Character counter
- Auto-resize

### PredictButton
- Accent-colored filled button
- Loading state with spinner
- Disabled state while loading

### BrainViewer
- 2x2 grid of brain surface images
- Labels below each view
- Colorbar component

### ROICard
- Name, sublabel, value, activation bar
- Clean bordered card

### ROISummary
- Horizontal scrollable row of ROICards
- Or responsive grid that wraps on mobile

### Navbar
- Wordmark left, links right
- Sticky on scroll
- Thin bottom border

### LoadingBar
- Thin horizontal bar, accent color
- Indeterminate animation (left to right pulse)

---

## Responsive Behavior

- **Desktop (>1024px):** Centered content, max-width ~800px for input, ~1000px for brain grid
- **Tablet (768-1024px):** Same layout, slightly tighter margins
- **Mobile (<768px):** Brain views stack 1 per row instead of 2x2. ROI cards stack vertically. Input full-width with padding.

---

## Interactions

1. User lands on page → sees heading + empty textarea
2. User types text → character count updates
3. User clicks "Predict" → button enters loading state, thin progress bar appears
4. ~10-30 seconds later → results fade in below
5. User scrolls down to see brain images and ROI cards
6. User can type new text at the top and run again → old results replaced with new ones
7. "View raw data →" expands a data table
8. Download CSV button in the expanded section

---

## Tech Stack (for v0)

- Next.js 14+ (App Router)
- Tailwind CSS
- TypeScript
- No external UI library needed — custom components matching the design language
- Font: `Newsreader` for headings (Google Fonts), `Inter` for body

---

## Color Tokens

```
--bg-primary: #F5F0E8        (warm cream, page background)
--bg-secondary: #EDE8DE       (slightly darker cream, for cards/sections)
--text-primary: #1A1A1A        (near-black, headings and body)
--text-secondary: #6B6459      (warm gray, subtitles and labels)
--text-muted: #9C9488          (lighter warm gray, placeholders and metadata)
--accent: #C4704B              (terracotta, buttons and highlights)
--accent-hover: #A85D3D        (darker terracotta)
--border: #E0DAD0              (subtle warm border)
--border-light: #EDE8DE        (even subtler border)
```

---

## What the Backend Returns (for mocking)

The frontend will call `POST /api/predict` with `{ text: "user input" }` and receive:

```json
{
  "brain_images": {
    "left_lateral": "/results/abc123/left_lateral.png",
    "right_lateral": "/results/abc123/right_lateral.png",
    "left_medial": "/results/abc123/left_medial.png",
    "right_medial": "/results/abc123/right_medial.png"
  },
  "roi_values": [
    { "name": "Broca's Area", "label": "BA 45 — left inferior frontal", "value": 0.82 },
    { "name": "STS", "label": "Superior temporal sulcus", "value": 0.71 },
    { "name": "TPJ", "label": "Temporoparietal junction", "value": 0.65 },
    { "name": "mPFC", "label": "Medial prefrontal cortex", "value": 0.58 },
    { "name": "FFA", "label": "Fusiform face area", "value": 0.12 },
    { "name": "Auditory Cortex", "label": "Primary auditory — A1", "value": 0.44 }
  ],
  "processing_time_seconds": 12.3,
  "n_timepoints": 8,
  "n_vertices": 20484
}
```

For the v0 prototype, mock this data. Use placeholder brain images (gray brain silhouettes with colored overlays) and hardcoded ROI values.

---

## Key Principles

1. **The brain is the hero.** The visualization should be the largest, most prominent element on the results page. Everything else supports it.
2. **One action per page.** Type text. Click predict. See results. No tabs, no sidebars, no settings panels in v1.
3. **Quiet until active.** The page is almost empty before the user types. Results appear only after prediction. Progressive disclosure.
4. **Scientific but not clinical.** It should feel like a page from a beautifully typeset research paper, not a hospital dashboard.
5. **Trust through restraint.** No marketing language, no "AI-powered" badges, no gradients. The tool speaks for itself.
