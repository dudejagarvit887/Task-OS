# Tambo OS

An AI-powered chat platform built with Next.js 16, Clerk auth, Tambo AI, and shadcn/ui. Features a sidebar-driven interface with organization workspaces, real-time AI chat, and tool integrations.

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Authentication**: Clerk (custom UI, organizations)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (new-york style) + Radix UI primitives
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)
- **Linting**: Biome
- **AI Chat**: Tambo AI (`@tambo-ai/react`)
- **Language**: TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Copy `example.env` to `.env.local`:
     ```bash
     cp example.env .env.local
     ```
   - Fill in the required values:
     - `NEXT_PUBLIC_TAMBO_API_KEY` — from [console.tambo.co](https://console.tambo.co)
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY` — from [Clerk Dashboard](https://dashboard.clerk.com)
     - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` & `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — route paths (defaults: `sign-in`, `sign-up`)
     - `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` & `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` — post-auth redirects (defaults: `/dashboard`, `/onboarding`)
4. Run the development server:
   ```bash
   pnpm run dev
   ```

## Scripts

```bash
pnpm run dev          # Start dev server with Turbopack
pnpm run build        # Production build
pnpm run start        # Start production server
pnpm run lint         # Run Biome lint
```

## Project Structure

```
app/
├── layout.tsx                     # Root layout (ClerkProvider, ThemeProvider)
├── (protected)/                   # Sidebar layout routes
│   ├── layout.tsx                 # TamboProvider + SidebarProvider + AppSidebar
│   └── dashboard/page.tsx         # Tambo AI chat (voice circle + message thread)
├── sign-in/[[...sign-in]]/        # Custom Clerk sign-in
├── sign-up/[[...sign-up]]/        # Custom Clerk sign-up
├── forgot-password/[[...forgot-password]]/
└── onboarding/                    # Workspace setup (solo/company)

components/
├── app-sidebar/                   # Main sidebar composition
├── org-switcher/                  # Clerk organization switcher
├── chat-history/                  # Chat list (Tambo threads)
├── link-integration-dialog/       # Integration connections dialog
├── nav-user/                      # User dropdown (footer)
├── layout-wrapper/                # Conditional header/footer
├── header/                        # Public page header
├── footer/                        # Public page footer
├── logo/                          # Logo component
├── hero/                          # Landing page hero
├── auth-loading/                  # Auth loading state
├── tambo/                         # Tambo AI chat components
├── tambo-wrapper/                 # TamboProvider client wrapper
├── theme-switcher/                # Dark/light toggle
└── ui/                            # shadcn/ui primitives

hooks/
└── useAuth.ts                     # Custom auth hook wrapping Clerk

lib/
└── tambo.ts                       # Tambo component registration

proxy.ts                           # Clerk middleware (route protection)
```

## Sidebar Structure

The sidebar (`components/app-sidebar/`) is composed of:

1. **Organization Switcher** — Clerk workspace switching via dropdown
2. **New Chat** — Button to start a new thread via Tambo
3. **Search** — Input with `Ctrl+K` hint
4. **Link Integration** — Dialog to connect tools (Gmail, Slack, Linear, GitHub, Cursor, MCP)
5. **Chat History** — "YOUR CHAT" section listing Tambo threads
6. **User Menu** — Avatar dropdown with sign out (footer)

## Authentication Flow

1. Unauthenticated users → `/sign-in`
2. Authenticated, no organization → `/onboarding`
3. Authenticated with organization → `/dashboard`

Organizations represent workspaces with two types:
- **Solo** — max 5 members, starter plan
- **Company** — unlimited members, enterprise plan

## Adding Protected Routes

Update three places:
1. `isProtectedRoute` matcher in `proxy.ts`
2. `isProtectedRoute` check in `components/layout-wrapper/index.tsx`
3. Add page under `app/(protected)/`

## Tambo AI Integration

The chat backend is powered by [Tambo AI](https://docs.tambo.co). Key files:

- `components/tambo-wrapper/` — Client component wrapping `TamboProvider` around protected routes
- `lib/tambo.ts` — Register custom generative UI components (Zod schemas + React components)
- `components/tambo/` — Pre-built chat primitives (message input, thread content, suggestions, MCP support)
- `app/(protected)/dashboard/page.tsx` — Composes Tambo primitives for the chat interface

To register a custom AI component, add it to the `components` array in `lib/tambo.ts`.

Tambo API key from [console.tambo.co](https://console.tambo.co).

## Adding shadcn Components

```bash
npx shadcn@latest add <component-name>
```

Components install to `components/ui/`. Uses "new-york" style with CSS variables.

