# ChaosCanvas Design Guidelines

## Design Approach
**Reference-Based Hybrid**: Combining Figma's canvas interaction model + Instagram's social engagement patterns + Linear's clean interface hierarchy + Discord's community layers approach.

**Core Principle**: "Organized Chaos" - maximize creative freedom while maintaining intuitive navigation. Think Figma meets TikTok for Gen Z creators.

---

## Typography

**Font Stack**:
- Primary: Inter (clean, modern, excellent at small sizes)
- Accent: Space Grotesk (bold headings, CTAs, playful elements)

**Hierarchy**:
- Canvas UI elements: 12-14px (Inter Medium)
- Navigation/tabs: 14-16px (Inter Semibold)
- Section headings: 20-24px (Space Grotesk Bold)
- Hero text: 32-48px (Space Grotesk Bold)
- Body text: 14-16px (Inter Regular)

---

## Layout System

**Spacing Units**: Use Tailwind units of **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Tight spacing: p-2, m-3
- Standard: p-4, gap-4
- Section padding: p-6 to p-8
- Large gaps: gap-12, py-16

**Grid System**: 
- Canvas area: Full viewport minus fixed sidebars
- Sidebar width: 320px (left AI co-pilot), 280px (right layers/economy)
- Mobile: Full screen canvas with collapsible bottom sheets

---

## Core Components

### 1. Canvas Workspace
- **Infinite scroll/zoom container** - no visible boundaries
- **Zoom level indicator** (bottom-left) - shows current layer (Global → Europe → Czechia → Prague...)
- **Grid subtle overlay** at certain zoom levels for spatial orientation
- **Real-time cursors** showing other users (avatar + username label)
- **Mini-map** (bottom-right corner, 200x150px) showing your position in the canvas

### 2. AI Co-Pilot Panel (Left Sidebar)
- **Collapsible panel** (w-80, can minimize to w-16 icon bar)
- **Chat-like interface** with user prompts + AI suggestions
- **Quick action chips** (Generate Image, Add Text, Transform, Remix)
- **Style preset carousel** (horizontal scroll: Meme, Pixel Art, Anime, Photo-realistic, etc.)
- **Recent suggestions list** with thumbnail previews

### 3. Layer Switcher (Top Bar)
- **Horizontal tab navigation** showing breadcrumb-style hierarchy
- Global → Continent → Country → City → Personal Bubble
- **Active layer highlighted** with underline + icon
- **Quick jump dropdown** for switching between saved locations

### 4. Credits & Economy Display (Top-Right)
- **Coin balance badge** (rounded-full, px-4 py-2) showing ChaosCoins with icon
- **Premium status indicator** (if ChaosGod subscriber)
- **Dropdown menu** for purchasing credits, viewing transaction history

### 5. Contribution Feed (Right Sidebar)
- **Timeline of recent additions** to current canvas layer
- **Card-based layout** (each contribution = thumbnail + author + timestamp)
- **Boost button** on each card (pay credits to amplify)
- **Filter tabs** (All, Following, Top Today, My Contributions)

### 6. Personal Bubble Interface
- **Distinct visual treatment** - softer, more intimate feeling
- **Friend invite panel** at top with avatar slots
- **Privacy toggle** (Public/Friends Only/Private)
- **Customization options** for bubble theme/rules

### 7. Meme Economy Dashboard (Modal/Panel)
- **Stock-market style table** with trending memes
- **Price chart previews** (simple line graphs)
- **Buy/Sell action buttons** (green/red)
- **Portfolio section** showing user's investments

### 8. Export & Share Panel
- **Canvas selection tool** (drag rectangle on canvas)
- **Export format options** (15s/30s/60s video, static image)
- **Watermark preview** with toggle
- **Platform quick-share buttons** (TikTok, Instagram, Twitter)

### 9. Navigation Bar (Mobile Bottom / Desktop Top)
- **Icon-based tabs**: Canvas, Explore, Personal, Economy, Profile
- **Floating action button** for quick AI generate
- **Notification badge** for live updates

### 10. Onboarding Tooltips
- **Contextual popovers** (first-time users)
- **Progress indicator** (5 steps to get started)
- **Dismiss/Skip options** clearly visible

---

## Interaction Patterns

**Canvas Interactions**:
- **Pinch to zoom** (mobile), **scroll to zoom** (desktop)
- **Drag to pan** with inertia
- **Double-tap** to place AI-generated content
- **Long-press** on content for context menu (Boost, Delete, Remix)

**Real-time Feedback**:
- **Pulse animation** on new contributions appearing
- **Smooth fade-in** for AI-generated content
- **Subtle glow** around boosted content

**Layer Transitions**:
- **Zoom animation** when switching layers (smooth 0.5s ease)
- **Blur-to-focus effect** as new layer loads

---

## Visual Style

**Card Design**:
- Rounded corners: rounded-lg to rounded-xl
- Subtle shadows: shadow-sm for elevation
- Border: 1px subtle stroke for definition

**Buttons**:
- Primary: Solid fill, rounded-full, px-6 py-3
- Secondary: Outline style, same rounding
- Icon buttons: Square or circle, p-2 to p-3
- Blur backgrounds for buttons on canvas/images

**Inputs**:
- Clean text inputs with subtle background fill
- Rounded-md corners
- Focus state with border highlight

**Badges & Tags**:
- Pill-shaped (rounded-full)
- Small padding (px-3 py-1)
- Used for credits, layer names, user roles

---

## Responsive Strategy

**Desktop (1024px+)**:
- Three-column layout: AI Panel (left) + Canvas (center) + Feed (right)
- Full toolbar visibility
- Keyboard shortcuts enabled

**Tablet (768-1023px)**:
- Two-column: Canvas + collapsible sidebar
- Bottom navigation for layer switching

**Mobile (<768px)**:
- Full-screen canvas
- **Bottom sheet UI** for AI co-pilot (slides up)
- **Hamburger menu** for navigation
- **Floating buttons** for key actions
- **Swipe gestures** for layer navigation

---

## Images

**Hero Section** (Marketing landing page, separate from app):
- Large hero image showing vibrant collaborative canvas in action
- Screenshot of multiple users creating chaos together
- Overlaid text with blur-background buttons

**In-App**:
- User avatars (circular, 32-40px)
- Content thumbnails in feeds (16:9 ratio preferred)
- Meme economy stock-chart graphics
- Tutorial/onboarding illustrations (playful, colorful)

---

## Multi-Language Considerations

- **Language selector** in top-right corner (flag icon + dropdown)
- **Currency display** adapts to locale (€, $, Kč)
- **Text wrapping** considerations for longer translations (German)
- **RTL support** structure (future Arabic, Hebrew)
- **Date/time formatting** per locale

---

This design creates an immersive, playful yet professional creative platform that scales from casual meme-making to serious creator economy participation, optimized for viral mobile-first usage while supporting power users on desktop.