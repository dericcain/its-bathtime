========================
AGENT INSTRUCTIONS
========================

App Name
- The app is called: “It’s Bathtime!”
- All references in the UI, manifest, and metadata must use this exact name.

Mission
- Build a Next.js (App Router) TypeScript PWA called “It’s Bathtime!”.
- Store all data locally in IndexedDB (local DB) using Dexie.
- No authentication.
- Deployable to Vercel.
- Offline-capable after first load.

Theme
- Comic-book style inspired by classic superhero team comics (Avengers vibe).
- MUST use original, non-branded visuals.
- DO NOT use:
  - Marvel
  - Avengers
  - Character names
  - Logos
  - Recognizable costumes
  - Copyrighted art
- Use generic “hero squad” comic styling:
  - Halftone dots
  - Thick ink borders
  - Panel layouts
  - Speech bubbles
  - Action words like POW!, BAM!, SPLASH!
  - Bold, high-contrast color palette (primary colors, black outlines)

Logo Requirement
- Generate a custom original logo for “It’s Bathtime!”
- Must be:
  - Text-based
  - Comic-style lettering
  - Thick black outline
  - Subtle 3D offset/shadow
  - Water splash elements integrated into the design
  - Possibly a speech bubble or burst background
- No copyrighted characters or references.
- Deliver as:
  - Inline SVG component (preferred)
  - Also usable as PWA icon base
- Keep it vector so it scales cleanly.

Tech Stack
- Next.js (latest stable) + TypeScript (App Router)
- IndexedDB via Dexie
- PWA via next-pwa (or equivalent)
- Avatar crop via react-easy-crop
- Charts via recharts
- Tailwind or CSS modules acceptable

Data Model (IndexedDB)

kids:
- id: string (nanoid/uuid)
- name: string
- avatarBlob?: Blob
- createdAt: number

sessions:
- id: string
- timestamp: number
- kidOrder: string[]
- luckyUsed: boolean
- luckyByKidId?: string

state (singleton):
- id: "singleton"
- rotationIndex: number
- currentOrder?: string[]
- currentLuckyUsed?: boolean
- currentLuckyByKidId?: string

Bath Order Logic

Default Order (Fair Rotation):
order[i] = kids[(rotationIndex + i) % kids.length]

Rules:
- Do NOT advance rotationIndex on refresh.
- Only advance rotationIndex after logging a session.
- Kids sorted by createdAt.

“I’m feeling lucky 🎲”

- Only the kid currently in 2nd position (index 1) can trigger it.
- On click:
  - Verify they are still second.
  - Shuffle using Fisher–Yates.
  - Update currentOrder only.
  - Set luckyUsed = true
  - Set luckyByKidId = kid who was second BEFORE shuffle.
  - Do NOT create a session yet.

Logging

Button: “Baths done → Log session”

On click:
- Persist session with:
  - timestamp
  - kidOrder
  - luckyUsed
  - luckyByKidId
- Advance rotationIndex = (rotationIndex + 1) % kids.length
- Reset nightly state.

Kid Management (/kids)

- Add kid:
  - Name input
  - Image upload
  - Crop with react-easy-crop
  - Export cropped image as Blob
  - Store in IndexedDB
- Edit name
- Replace avatar
- Remove kid:
  - Keep historical sessions intact.
- Require ≥ 2 kids to log sessions.

Stats (/stats)

- Compute from sessions dynamically.
- For each kid:
  - Count appearances at position 1..N.
- Render:
  - Stacked bar chart (recharts)
  - Table: Kid | #1 | #2 | #3 | … | Total

PWA Requirements

- manifest.json:
  - name: “It’s Bathtime!”
  - short_name: “Bathtime”
  - theme_color: comic-style bold color
- Installable
- Offline app shell caching
- Vercel compatible

Edge Cases

- 0 kids → redirect to setup.
- 1 kid → disable logging.
- rotationIndex out of range → reset to 0.
- Kids count change → rotationIndex %= kids.length.

Deliverables

- Full project structure
- Key files:
  - next.config.js
  - manifest
  - lib/db.ts
  - lib/bathOrder.ts
  - components (Logo, KidCard, OrderList, CropModal, StatsChart)
- Comments explaining:
  - Dexie schema
  - rotation logic
  - Fisher–Yates shuffle
  - stats aggregation
  - PWA config
- Setup + deploy instructions
  - Use the Vercel MCP to set up the project and deploy the app.
  - Use Github MCP to create the private repo and push changes
