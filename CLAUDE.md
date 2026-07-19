# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev          # Start dev server with Turbopack
pnpm run build        # Production build
pnpm run start        # Start production server
pnpm run lint         # Run Biome lint
npx shadcn@latest add <component>  # Add a new shadcn/ui component
```

## Architecture

**Tambo OS** — an AI chat platform built with Next.js 16, Clerk auth, shadcn/ui, and Tailwind CSS 4.

### Routing & Auth (proxy.ts)

Next.js 16 replaces traditional middleware with `proxy.ts`. This file uses `clerkMiddleware` from `@clerk/nextjs/server` and handles all routing logic:

- **Unauthenticated** → redirected to `/sign-in` when accessing protected routes
- **Authenticated, no organization** → redirected to `/onboarding` (workspace setup)
- **Authenticated, has organization** → redirected to `/dashboard` from public routes
- **On onboarding with org** → redirected to `/dashboard`

When adding new protected routes, update **three places**:
1. `isProtectedRoute` matcher in `proxy.ts`
2. `isProtectedRoute` check in `components/layout-wrapper/index.tsx` (controls header/footer visibility)
3. Add the page under `app/(protected)/` to inherit the sidebar layout

### Route Groups

- `app/(protected)/` — Routes with sidebar layout. Uses `SidebarProvider` + `AppSidebar` + `SidebarInset` in `layout.tsx`.
- `app/sign-in/`, `app/sign-up/`, `app/forgot-password/` — Clerk auth pages with custom UI (not Clerk's prebuilt components).
- `app/onboarding/` — Post-signup workspace selection flow. Creates a Clerk organization (solo or company) via server action in `actions.ts`.

### Auth Pattern

Custom auth hook at `hooks/useAuth.ts` wraps Clerk's `useSignIn`/`useSignUp`/`useClerk` with state management for loading, errors, and multi-step flows (email verification, password reset). Auth pages use this hook rather than Clerk's prebuilt components.

Server-side auth uses `auth()` and `clerkClient()` from `@clerk/nextjs/server` (see `app/onboarding/actions.ts`).

### Organization Model

Clerk Organizations represent workspaces. Two types stored in `publicMetadata`:
- **Solo** (`workspaceType: "solo"`) — max 5 members, starter plan
- **Company** (`workspaceType: "company"`) — unlimited members, enterprise plan

Users without an organization are always redirected to `/onboarding`.

### Sidebar Structure (components/app-sidebar/)

The sidebar is the primary navigation for authenticated users. It composes these components top-to-bottom:

1. **SidebarHeader** → `OrgSwitcher` (`components/org-switcher/`) — Clerk org switching via `useOrganization` + `useOrganizationList` hooks with shadcn DropdownMenu
2. **SidebarContent** contains (in order):
   - **New Chat button** — `Button` with `MessageSquarePlus` icon, calls `useTamboThread().startNewThread()`
   - **Search input** — text input with `Ctrl+K` keyboard hint badge
   - **Link Integration** — `LinkIntegrationDialog` (`components/link-integration-dialog/`) using shadcn Dialog, shows grid of integrations (Gmail, Slack, Linear, GitHub, Cursor, MCP)
   - **Chat History** — `ChatHistory` (`components/chat-history/`) with `SidebarGroupLabel` "YOUR CHAT", uses `useTamboThreadList()` for real thread data and `useTamboThread().switchCurrentThread()` for navigation
3. **SidebarFooter** → `NavUser` (`components/nav-user/`) — user avatar dropdown with sign out

All sidebar sections except OrgSwitcher and NavUser hide when collapsed via `group-data-[collapsible=icon]:hidden`.

### Tambo Integration

The app uses **Tambo AI** (`@tambo-ai/react`) for chat functionality. Key integration points:

- **TamboProvider** — Wraps all protected routes via `components/tambo-wrapper/index.tsx` (client component). Configured with API key from `NEXT_PUBLIC_TAMBO_API_KEY` and components from `lib/tambo.ts`.
- **Component registration** — `lib/tambo.ts` exports a `components` array of `TamboComponent[]`. Register custom generative UI components here with Zod schemas.
- **Tambo UI components** — Pre-built chat primitives in `components/tambo/`: `ThreadContent`, `MessageInput`, `ScrollableMessageContainer`, `MessageSuggestions`, `MessageGenerationStage`, etc.
- **Tambo hooks used**: `useTambo()` (thread + generation state), `useTamboThread()` (switch/create threads), `useTamboThreadList()` (list all threads), `useTamboThreadInput()` (input control)

### Dashboard Page (app/(protected)/dashboard/)

Two states:
- **Empty state** (no messages) — Voice circle animation + Tambo `MessageInput` + suggestion chips
- **Chat state** (has messages) — `ScrollableMessageContainer` > `ThreadContent` > `ThreadContentMessages` for message display, `MessageGenerationStage` for streaming status, `MessageInput` for composing

### UI Components

- **shadcn/ui** — "new-york" style, CSS variables, installed in `components/ui/`. Add new ones via `npx shadcn@latest add <name>`.
- **Installed components**: avatar, badge, breadcrumb, button, card, collapsible, dialog, dropdown-menu, input, label, separator, sheet, sidebar, skeleton, switch, tooltip
- **Icons** — Lucide React (`lucide-react`)
- **Theming** — `next-themes` with `ThemeProvider` in root layout. Dark/light mode via CSS variables in `app/globals.css` using OKLch color space.
- **Layout** — `LayoutWrapper` (client component) conditionally renders Header/Footer based on pathname. Protected routes use the sidebar layout instead.

### Key Component Patterns

- **Sidebar components** use shadcn sidebar primitives: `SidebarMenu` > `SidebarMenuItem` > `SidebarMenuButton` for menu items, `SidebarGroup` + `SidebarGroupLabel` for sections
- **Dropdowns in sidebar** (OrgSwitcher, NavUser) follow the same pattern: shadcn `DropdownMenu` wrapping a `SidebarMenuButton` as trigger, with `useSidebar()` for `isMobile` to position content
- **Clerk hooks** used: `useUser()`, `useClerk()`, `useOrganization()`, `useOrganizationList()`
- **Tambo hooks** used: `useTambo()`, `useTamboThread()`, `useTamboThreadList()`
- **Dialog pattern**: shadcn `Dialog` + `DialogTrigger` wrapping a `SidebarMenuButton`

### Path Alias

`@/*` maps to the project root (e.g., `@/components/ui/button`).

### Linting

Uses **Biome** (not ESLint). Configuration in `biome.json`:
- Tab indentation
- Single quotes for JS/JSX
- Trailing commas (ES5)
- Import organization with `@/` prefix convention

### Environment Variables

Clerk keys in `.env`. Key redirect URLs:
- `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` — where to go after sign-in (currently `/dashboard`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` — where to go after sign-up (currently `/onboarding`)

<!-- tambo-docs-v1.0 -->
## Tambo AI Framework

This project uses **Tambo AI** for building AI assistants with generative UI and MCP support.

**Documentation**: https://docs.tambo.co/llms.txt

### CLI Commands (Non-Interactive)

The Tambo CLI auto-detects non-interactive environments. Use these commands:

```bash
# Initialize (requires API key from https://console.tambo.co)
npx tambo init --api-key=sk_...

# Add components
npx tambo add <component> --yes

# List available components
npx tambo list --yes

# Create new app
npx tambo create-app <name> --template=standard

# Get help
npx tambo --help
npx tambo <command> --help
```

**Exit codes**: 0=success, 1=error, 2=requires flags (check stderr for exact command)

## Tambo Generative UI

- Props are `undefined` during streaming—always use `?.` and `??`
- Use `useTamboComponentState` for state the assistant needs to see
- Use `useTamboStreamStatus` when you need to control UI behavior based on streaming state
- Common `useTamboStreamStatus` use cases: disabling buttons, showing section-level loading, waiting for required fields before rendering
- String props can render as they stream; structured data like arrays/objects may stream progressively or wait for completion depending on the use case
- Generate array item IDs client-side—React keys must be stable, and AI-generated IDs are unreliable during streaming
- If the item IDs are used to fetch data, use `useTamboStreamStatus` to wait until the array is complete before rendering
- Fetch server data or derive from app state; don't have AI generate what already exists
- Use `.describe()` to guide prop generation