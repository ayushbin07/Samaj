# Samaj Frontend — Master Build Prompt

## 0. PROJECT CONTEXT

You are building the **frontend only** for a Samaj backend project.

There are two directories/projects:

```text
backend/
frontend/
```

### Backend

```text
backend/
```

This is the existing Node.js/Express/MongoDB backend.

### Frontend

```text
frontend/
```

This is the project you are responsible for building.

---

# 1. ABSOLUTE RULE: DO NOT TOUCH THE BACKEND

This is the most important requirement.

## `backend/` is READ-ONLY.

You may inspect the backend to understand:

- routes
- controllers
- models
- schemas
- request bodies
- response structures
- authentication
- available functionality
- API endpoints
- existing data relationships

You may NOT modify it.

### NEVER:

- modify backend files
- edit backend routes
- edit controllers
- edit models
- edit schemas
- edit middleware
- edit authentication
- modify database logic
- modify database schemas
- add backend endpoints
- remove backend endpoints
- rename backend endpoints
- change API response structures
- fix backend bugs
- refactor backend code
- install backend dependencies
- modify backend environment files
- generate backend code
- create backend workarounds
- change backend configuration

## CRITICAL PRINCIPLE

> **The frontend adapts to the backend. The backend does NOT adapt to the frontend.**

If the frontend needs functionality that the backend does not currently provide:

**DO NOT modify the backend.**

Instead:

1. Build the UI.
2. Make the UI functional locally where reasonable.
3. Clearly treat unsupported functionality as frontend-only/mock behavior.
4. Use **Coming Soon** where appropriate.

---

# 2. CURRENT BACKEND CAPABILITIES

The backend is an evolving Samaj API.

Currently, the **Tweet/Twitter functionality is implemented and usable**.

Other YouTube-style functionality may exist partially, completely, or not at all.

Before implementing the frontend, inspect the backend and create an internal understanding of:

- authentication endpoints
- user endpoints
- video endpoints
- tweet endpoints
- subscription endpoints
- playlist endpoints
- comment endpoints
- like endpoints
- dashboard/channel endpoints
- upload endpoints
- any other available routes

Do NOT assume an endpoint exists simply because a YouTube feature normally requires it.

The backend API is the source of truth.

---

# 3. FRONTEND OBJECTIVE

Build a polished **video hosting platform** using the existing backend.

This should feel like a real modern product inspired by platforms such as YouTube, Vimeo, and modern creator platforms.

However:

> **Do NOT create a pixel-for-pixel YouTube clone.**

The product should have its own visual identity.

The UI should communicate:

- video hosting
- creators
- channels
- discovery
- subscriptions
- community
- personal library
- video playback

The design should be based on the actual capabilities and data structures exposed by the backend.

---

# 4. TECHNOLOGY REQUIREMENTS

Use:

- Next.js
- App Router
- TypeScript
- React
- HeroUI
- Tailwind CSS
- shadcn/ui only when HeroUI does not provide an appropriate component
- Lucide icons where appropriate

Do not introduce unnecessary frameworks.

Prefer a clean, maintainable architecture over excessive abstraction.

---

# 5. HEROUI IS THE PRIMARY UI LIBRARY

HeroUI is the first choice for UI components.

Install/configure HeroUI using:

```bash
npm install heroui-cli@latest -g
```

Use the HeroUI React MCP:

```json
{
  "servers": {
    "heroui-react": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@heroui/react-mcp@latest"]
    }
  }
}
```

Install the HeroUI agent skills:

```bash
curl -fsSL https://heroui.com/install | bash -s heroui-react
```

Generate the agent instructions:

```bash
npx heroui-cli@latest agents-md --react
```

Use the resulting HeroUI guidance throughout development.

---

# 6. SHADCN/UI FALLBACK

HeroUI is the primary component library.

If HeroUI does not provide an appropriate component for a required UI element, use shadcn/ui.

Initialize it appropriately:

```bash
npx shadcn@latest init -t [framework]
```

Add the shadcn skill:

```bash
npx skills add shadcn/ui
```

Initialize the MCP:

```bash
npx shadcn@latest mcp init --client vscode
```

## COMPONENT RULE

**Never manually build a UI primitive when HeroUI or shadcn/ui provides it.**

Do NOT create custom implementations of:

- Button
- Input
- Textarea
- Modal
- Dialog
- Drawer
- Dropdown
- Select
- Checkbox
- Radio
- Switch
- Tabs
- Tooltip
- Popover
- Card
- Navbar
- Avatar
- Chip
- Spinner
- Progress
- Skeleton
- Pagination
- Breadcrumb
- Toast

Use the existing component libraries.

Custom components are encouraged for **product-specific compositions**, but they should be composed from library components.

For example:

```text
VideoCard
```

is fine.

But:

```text
CustomButton
```

is not acceptable if HeroUI already provides Button.

---

# 7. DESIGN DIRECTION

Create a **premium modern video platform**.

Do not simply copy YouTube's interface.

The design should feel like a serious product that could plausibly be launched.

### Visual characteristics

- Premium
- Clean
- Modern
- Dark-first
- Excellent typography
- Strong spacing system
- Subtle depth
- Refined borders
- Elegant surfaces
- Good contrast
- Responsive
- Smooth interactions
- Minimal visual noise

Use a carefully selected premium color palette.

Do NOT randomly use gradients everywhere.

Do NOT make every card glow.

Do NOT use excessive glassmorphism.

Do NOT create the stereotypical "AI-generated SaaS dashboard" aesthetic.

The UI should feel intentional.

---

# 8. RESPONSIVE DESIGN

The application must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

Do not treat mobile as an afterthought.

On mobile:

- navigation should adapt appropriately
- video cards should reflow
- sidebar should become a mobile-friendly navigation pattern
- player should use available screen width
- controls should remain usable
- typography should scale appropriately
- touch targets must be practical

---

# 9. APPLICATION STRUCTURE

Build the application around the concept of a video hosting service.

Potential structure:

```text
Home
Videos
Explore
Subscriptions
Channels
Watch
Library
History
Playlists
Community
Tweets
Profile
Settings
```

Only make routes/data-driven when the backend supports them.

If a feature is not supported by the backend, the UI can still exist but should use an appropriate **Coming Soon** state.

---

# 10. AUTHENTICATION

Login and Register must be included.

Inspect the backend first.

If the backend already provides:

- registration
- login
- logout
- refresh token
- current user
- authentication middleware

use those APIs.

Do not invent authentication endpoints.

Build polished:

### Register

Include appropriate fields based on the actual backend requirements.

### Login

Include:

- username/email as appropriate
- password
- loading state
- validation
- error state
- successful authentication flow

Authentication state should be handled cleanly on the frontend.

Do not duplicate backend authentication logic.

---

# 11. API INTEGRATION

Before building feature-specific UI, inspect the backend routes and understand the actual API.

Create a clean frontend API layer.

Do not scatter raw `fetch()` calls throughout components.

Prefer a structure such as:

```text
src/
  lib/
    api/
      client.ts
      auth.ts
      videos.ts
      users.ts
      tweets.ts
      subscriptions.ts
```

Adapt the exact structure to the project.

The frontend should have clear separation between:

- UI
- API calls
- server state
- types
- feature logic

---

# 12. DATA FETCHING

Use an appropriate server-state solution such as TanStack Query if useful.

Avoid unnecessary global state.

Server data should not be duplicated into random React state without a reason.

Handle:

- loading
- success
- empty
- error
- retry

states properly.

---

# 13. VIDEO EXPERIENCE

The primary experience should be video discovery and viewing.

Build a polished:

### Home page

Possible elements:

- featured content
- video grid
- recent videos
- creator information
- categories where backend data supports them

### Video page

Include:

- video player
- title
- creator
- metadata
- description
- subscription action where supported
- engagement actions
- related videos

### Video cards

Include appropriate information based on backend data:

- thumbnail
- title
- creator
- views
- upload date
- duration if available

Do not invent fields that the API does not provide.

---

# 14. LIKE AND COMMENT BEHAVIOR

The backend currently does NOT have usable Like and Comment APIs.

Therefore:

## DO NOT CREATE BACKEND ENDPOINTS.

## DO NOT MODIFY THE BACKEND.

The frontend may provide **mock/fake interaction** for these features.

For example:

### Like

The user can click Like.

The UI can visually change:

```text
Like → Liked
```

But this is only local/mock frontend state.

Do NOT claim that the Like was persisted to the backend.

### Comments

Provide the visual comment interface.

Users may be able to:

- open comments
- type a comment
- submit a mock comment
- see it appear locally

But clearly treat this as temporary/mock behavior.

A refresh may reset mock comments.

Use subtle UI messaging where appropriate.

Example:

```text
Comments are coming soon.
```

or:

```text
Preview feature
```

Do not make fake backend calls.

---

# 15. COMING SOON SYSTEM

Missing backend functionality should NOT result in broken pages.

Create a polished reusable Coming Soon experience.

It should be used for functionality that requires APIs which do not yet exist.

Examples:

- comments
- likes
- playlists if unavailable
- history if unavailable
- watch later if unavailable
- advanced creator analytics
- notifications
- recommendations if unavailable

The Coming Soon UI should feel intentional, not like an error page.

---

# 16. TWITTER / TWEETS

The Tweet functionality currently exists in the backend.

Therefore this should be one of the first fully integrated frontend sections.

Create a polished Tweets/Community experience using the **actual backend APIs**.

Support whatever operations the backend currently supports.

For example, if available:

- fetch tweets
- create tweet
- view tweet
- user information
- timestamps

Do not invent Tweet APIs.

Do not change the Tweet backend.

The Tweets section can be presented as the platform's:

```text
Community
```

or:

```text
Community / Tweets
```

experience.

It should feel integrated into the video platform rather than looking like a completely unrelated Twitter clone.

---

# 17. NAVIGATION

Create a clear application navigation system.

Desktop can use:

- top navigation
- collapsible/sidebar navigation

Mobile can use:

- compact top bar
- bottom navigation
- drawer

depending on what produces the cleanest UX.

Possible primary destinations:

```text
Home
Explore
Subscriptions
Library
Community
```

Secondary destinations can include:

```text
History
Playlists
Your Videos
Profile
Settings
```

Only show fully functional destinations where backend support exists.

Unsupported features should lead to a polished Coming Soon page/state.

---

# 18. LOADING STATES

Every asynchronous page should have intentional loading states.

Use HeroUI components or appropriate shadcn components.

Examples:

- Skeleton cards
- Skeleton text
- Spinner where appropriate
- Loading buttons
- Player loading state

Do not leave blank white/dark screens while data loads.

---

# 19. ERROR STATES

Build proper error states.

Examples:

```text
Something went wrong.
We couldn't load this content.

Try again
```

Use proper UI components.

Do not expose raw stack traces or backend errors directly to users.

---

# 20. EMPTY STATES

Handle empty API responses.

Examples:

```text
No videos yet.

This creator hasn't uploaded any videos.
```

or:

```text
No subscriptions yet.

Creators you subscribe to will appear here.
```

Empty states should look designed, not like missing data.

---

# 21. NOTIFICATIONS / TOASTS

Use HeroUI/shadcn-supported notification patterns.

Show useful feedback for actions such as:

- login success
- registration success
- tweet creation
- API errors
- mock Like
- mock Comment
- copied link
- logout

Do not spam users with notifications for trivial actions.

---

# 22. ICONS

Prefer Lucide icons or icons provided by the UI ecosystem.

Do not manually draw interface SVGs unless there is a genuinely product-specific visual reason.

---

# 23. ACCESSIBILITY

Use:

- semantic HTML
- accessible labels
- keyboard navigation
- appropriate focus states
- sufficient contrast
- usable touch targets
- accessible dialogs/dropdowns
- meaningful alt text

Do not sacrifice accessibility for visual effects.

---

# 24. TYPESCRIPT

Use TypeScript properly.

Avoid:

```ts
any;
```

unless there is a genuinely unavoidable reason.

Create types/interfaces based on actual API responses.

Do not blindly duplicate backend schemas.

Only model what the frontend needs.

---

# 25. ENVIRONMENT VARIABLES

Backend URL should be configurable through an environment variable.

For example:

```env
NEXT_PUBLIC_API_URL=...
```

Do not hardcode localhost URLs throughout the application.

Do not modify the backend environment.

---

# 26. COMPONENT ARCHITECTURE

Prefer reusable product components.

Examples:

```text
VideoCard
VideoGrid
VideoPlayer
CreatorAvatar
CreatorCard
ChannelHeader
TweetCard
TweetComposer
Sidebar
MobileNavigation
SearchBar
ComingSoon
EmptyState
ErrorState
```

These should be composed using HeroUI/shadcn primitives.

Avoid huge monolithic page components.

---

# 27. CODE QUALITY

Keep the codebase:

- readable
- modular
- maintainable
- typed
- consistent

Avoid:

- unnecessary abstractions
- premature design systems
- giant components
- duplicated API logic
- duplicated UI logic
- random utility files
- excessive comments explaining obvious code

Comments should explain **why**, not merely **what**.

---

# 28. DO NOT OVERENGINEER

This is a student project evolving into a serious portfolio project.

Do not turn it into an enterprise architecture dissertation.

Prefer:

```text
simple
clear
maintainable
```

over:

```text
abstract
over-engineered
impossible to understand
```

---

# 29. DEVELOPMENT PROCESS

Follow this order.

## Phase 1 — Inspect

Before writing significant frontend code:

1. Inspect `backend/`.
2. Identify backend routes.
3. Identify authentication flow.
4. Identify request/response formats.
5. Identify currently usable features.
6. Identify missing features.
7. Map backend functionality to frontend pages.

Do not modify anything in the backend.

---

## Phase 2 — Frontend foundation

Set up:

- Next.js
- TypeScript
- Tailwind
- HeroUI
- HeroUI MCP
- HeroUI agent instructions
- shadcn fallback
- shadcn MCP
- API client
- environment configuration
- application layout
- theme
- typography
- navigation

---

## Phase 3 — Authentication

Implement:

- Register
- Login
- Logout
- authenticated user state

based only on existing backend capabilities.

---

## Phase 4 — Core Video Experience

Build:

- Home
- Video listing
- Video cards
- Video page
- Player
- Creator/channel information

using actual backend APIs.

---

## Phase 5 — Community

Integrate the existing Tweet APIs.

Make Tweets feel like part of the Samaj ecosystem.

---

## Phase 6 — Missing Features

For unsupported backend functionality:

- build the visual experience
- provide mock/local interactions when useful
- clearly mark unsupported persistence
- use Coming Soon where appropriate

Never modify the backend.

---

## Phase 7 — Polish

Perform a complete UI pass:

- spacing
- typography
- responsive behavior
- loading states
- empty states
- error states
- hover states
- focus states
- transitions
- accessibility
- consistency

Remove placeholder-looking UI.

---

# 30. IMPORTANT RULE ABOUT MOCK FEATURES

A mock feature must never silently pretend to be a real backend feature.

For example:

### Acceptable

```text
❤️ Liked

This interaction is currently local.
```

### Not acceptable

Making a fake API request and displaying:

```text
Like saved successfully
```

when no backend persistence exists.

The user should never be misled about what the backend actually supports.

---

# 31. DO NOT INVENT API CONTRACTS

If an endpoint is not present:

```text
DO NOT INVENT IT.
```

If the response format is different from what you expected:

```text
ADAPT THE FRONTEND.
```

If data is unavailable:

```text
HANDLE THE MISSING DATA GRACEFULLY.
```

If functionality requires a backend feature that does not exist:

```text
COMING SOON / MOCK UI.
```

Never modify the backend to make the frontend easier.

---

# 32. VISUAL QUALITY BAR

The finished application should feel like:

> A polished independent video hosting platform.

Not:

> A YouTube tutorial clone.

Not:

> A generic Tailwind dashboard.

Not:

> A collection of disconnected UI components.

Not:

> An AI-generated landing page with gradients everywhere.

The interface should have a consistent visual language.

Use a premium color palette with:

- strong primary accent
- neutral surfaces
- subtle borders
- clear hierarchy
- restrained accent usage

Dark mode should be a first-class experience.

---

# 33. FINAL SAFETY CHECK

Before finishing any task, verify:

```text
[ ] Backend files were not modified.
[ ] Backend routes were not modified.
[ ] Backend schemas were not modified.
[ ] Backend controllers were not modified.
[ ] Backend dependencies were not modified.
[ ] No new backend endpoint was created.
[ ] No backend response was changed.
[ ] Frontend uses actual backend routes where available.
[ ] Missing backend functionality is handled with mock UI or Coming Soon.
[ ] HeroUI is used for available UI primitives.
[ ] shadcn/ui is only used when HeroUI lacks an appropriate component.
[ ] No UI primitive was unnecessarily built from scratch.
[ ] Login/Register are implemented according to actual backend APIs.
[ ] Tweets use the existing backend API.
[ ] Like/Comment remain frontend-only/mock until backend support exists.
[ ] Responsive design works.
[ ] Loading states exist.
[ ] Empty states exist.
[ ] Error states exist.
[ ] TypeScript is properly typed.
[ ] No unnecessary `any`.
[ ] No hardcoded backend URL.
[ ] Accessibility has been considered.
[ ] UI feels like an independent video platform rather than a YouTube copy.
```

# FINAL INSTRUCTION

Build the frontend aggressively and creatively, but respect the boundary:

> **`backend/` is sacred. Read it. Understand it. Never edit it directly from frontend tasks.**

Everything else should happen inside:

```text
frontend/
```

The backend already exists for a reason. The frontend's job is to make that API feel like a real product, not to rewrite the API because the frontend got impatient.
