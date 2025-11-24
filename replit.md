# ChaosCanvas

## Overview

ChaosCanvas is a viral social creative platform that combines TikTok's engagement mechanics with collaborative canvas creation. Users create content through AI prompts on an infinite zoomable canvas, competing in national leagues while earning ChaosCoins through contributions. The platform emphasizes mobile-first design, gamification, and viral shareability with features like daily themed prompts, real-time collaboration, and a meme economy system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- Vite-powered React application with TypeScript strict mode
- Mobile-first responsive design targeting <768px breakpoint
- Component library: shadcn/ui with Radix UI primitives
- Styling: Tailwind CSS with custom design tokens (28px border radius, purple accent colors)
- Typography: Inter for body text, Space Grotesk/Clash Display for headings

**State Management**
- TanStack Query (React Query) for server state with 5-second refetch intervals
- AppContext for global app state (locale, currency, user session, ChaosCoins balance)
- WebSocket integration for real-time canvas collaboration
- LocalStorage for theme preferences, language/currency settings, and guest user tracking

**Routing & Pages**
- Wouter for client-side routing
- Core routes: `/` (canvas), `/league`, `/profile`, `/today` (viral landing page)
- Dynamic OG image generation for social sharing at `/api/og/today.png`

**Key UI Patterns**
- Full-screen vertical infinite feed (TikTok-style swipe navigation)
- Stories banner at top (Instagram-style) for daily prompts and takeover countdowns
- Floating action buttons: Main creator (+) button and AI Copilot bubble
- Bottom navigation bar with 4 tabs: Canvas | League | Mine | Profile
- Edge-to-edge design with safe-area handling for notches

**Animations & Effects**
- Framer Motion for spring animations and micro-interactions
- canvas-confetti library for celebration effects
- Web Audio API for sound effects (boost, like, contribution sounds)
- Haptic feedback via navigator.vibrate on mobile interactions

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Development: Vite middleware for HMR
- Production: Static file serving from dist/public
- Sentry integration for error tracking

**Database Layer**
- Drizzle ORM with PostgreSQL (Neon serverless driver)
- Schema-driven development with zod validation
- Tables: users, canvas_layers, contributions, transactions, chaos_bubbles, investments, national_chaos_scores, chaos_takeovers, daily_highlights, seed_prompts

**Real-time Communication**
- WebSocket server for live canvas collaboration
- Layer-based room system (clients subscribe to specific layer IDs)
- Broadcasts: new contributions, boost events, position updates

**API Design**
- RESTful endpoints under `/api` prefix
- Key routes:
  - `/api/users` - User management and anonymous-to-registered migration
  - `/api/canvas-layers` - Layer hierarchy (global → continent → country → city → personal)
  - `/api/contributions` - Content creation, boosting, pricing
  - `/api/daily-seed-prompts` - Localized daily themes
  - `/api/national-chaos-league` - Country leaderboard
  - `/api/chaos-takeover` - Weekly takeover bidding system

**Authentication & Session Management**
- Anonymous users start with guest IDs (no registration required)
- Session-based auth with connect-pg-simple for PostgreSQL session store
- Migration path: anonymous contributions preserved when upgrading to registered account
- Stripe customer/subscription tracking for premium features

**Scheduled Tasks (node-cron)**
- Daily highlights generation at 8 PM UTC
- Hourly meme economy price updates
- Daily cleanup of contributions older than 7 days
- Nightly national league score recalculation

**Rate Limiting & Quotas**
- 20 contributions per 5 minutes (sliding window)
- 15 contributions per day for free tier
- Premium tiers (Pro, God) remove limits

### Internationalization (i18n)

**Multi-language Support**
- 15 languages: cs-CZ, de-DE, en-US, sk-SK, pl-PL, es-ES, fr-FR, fil-PH, id-ID, pt-BR, tr-TR, vi-VN, ja-JP, ko-KR, ru-RU
- Custom translation system in `lib/i18n.ts` with nested key paths
- Locale auto-detection from browser (navigator.language)
- Locale-to-currency mapping (e.g., cs-CZ → CZK, fil-PH → PHP)
- Daily seed prompts stored with translations object per theme

**Currency Handling**
- Multi-currency pricing with formatPrice utility
- ChaosCoins as unified in-app currency (1:1 with EUR/USD/CZK)
- Stripe integration planned for multi-currency payments

### Gamification & Viral Features

**National Chaos League**
- Real-time country leaderboard based on contribution count + boosts + exports
- Score formula: contributions (10 pts) + boosts (5 pts) + exports (20 pts)
- Live updates via WebSocket broadcast
- Visual indicators: country flags, trending arrows, confetti on rank-ups

**Chaos Takeover Mode**
- Weekly event where users bid ChaosCoins to control global canvas for 60 seconds
- Countdown timer in top bar
- Streaming integration target (TikTok Live, Twitch)

**Daily Seed Prompts**
- AI-generated themes reset daily at midnight UTC
- Localized translations for each supported language
- Examples: "Létající svíčková nad Prahou" (Flying beef sirloin over Prague)

**Meme Economy**
- Each contribution has dynamic price based on boost velocity
- Users can invest ChaosCoins in trending contributions
- Portfolio tracking shows investment performance

**AI Co-Pilot**
- Text-to-image prompt interface
- Style presets: Meme, Pixel Art, Anime, Photo-realistic, Surreal
- Voice-to-text input support
- Integration points for external AI APIs (Flux, RunwayML, Veo)

## External Dependencies

### Third-Party APIs (Planned/In Development)
- **Stripe**: Payment processing, subscriptions (Pro/God tiers)
- **AI Generation Services**: Flux (image), Suno (audio), RunwayML/Veo (video)
- **Social Sharing**: Native Web Share API, platform-specific deep links (TikTok, Instagram)

### Database
- **PostgreSQL** via Neon serverless (@neondatabase/serverless)
- Connection pooling enabled
- DATABASE_URL environment variable required

### UI Component Libraries
- **Radix UI**: 20+ components (Dialog, Dropdown, Tabs, Toast, etc.)
- **Lucide Icons**: SVG icon library
- **react-icons**: Social media icons (SiTiktok, SiInstagram, SiX)

### Build & Development Tools
- **Vite**: Build tool with HMR, runtime error overlay
- **Drizzle Kit**: Database migrations and schema push
- **TypeScript**: Strict mode with path aliases (@/, @shared/, @assets/)
- **PostCSS**: Tailwind processing with autoprefixer
- **esbuild**: Production server bundling

### Monitoring & Analytics
- **Sentry**: Error tracking (@sentry/node)
- SENTRY_DSN environment variable

### Asset Management
- Google Fonts: Inter (body), Space Grotesk (headings)
- Custom logo variants: main, glitch, national (per-country), watermark
- OG image generation for social previews

### Security Considerations
- CORS configured for WebSocket upgrades
- CSP headers for production
- Session secret rotation
- Raw body parsing for webhook verification (Stripe)
- Safe-area CSS for mobile notch handling