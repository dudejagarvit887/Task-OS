# Deploying Tambo OS

This guide covers deploying **Tambo OS** (Next.js 16 + Clerk + Tambo AI) to **Vercel** (recommended) and **Render** (free tier). It lists every environment variable, where to get each value, and the exact steps.

- Package manager: **pnpm** (a `pnpm-lock.yaml` is committed)
- Node: **20 or newer** (Next.js 16 requires Node 18.18+; use 20 LTS)
- Build: `pnpm build` · Start: `pnpm start`

---

## 1. Environment variables

There is **no `.env` in the repo** (it's gitignored). You must set these in your host's dashboard. A ready-to-fill template lives in `.env.local` (local) and `example.env` (reference).

### Required — the app will not boot without these

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_TAMBO_API_KEY` | [console.tambo.co](https://console.tambo.co) → your project → **API Keys** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) → **API Keys** (`pk_live_…` for prod) |
| `CLERK_SECRET_KEY` | Clerk → **API Keys** (`sk_live_…` for prod) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Fixed value: `sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Fixed value: `sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Fixed value: `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Fixed value: `/onboarding` |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL, e.g. `https://tambo-os.vercel.app` (see the chicken-and-egg note below) |

### Optional — only needed for that specific integration

| Variable | Feature | Where to get it |
|---|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Gmail + Google Calendar | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth client ID |
| `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET` | Slack integration | [api.slack.com/apps](https://api.slack.com/apps) → your app → **Basic Information** |
| `NEXT_PUBLIC_INWORLD_API_KEY` | Voice / text-to-speech | [studio.inworld.ai](https://studio.inworld.ai) → API keys |

> Integration code falls back to `http://localhost:3000` when `NEXT_PUBLIC_APP_URL` is unset, so OAuth callbacks **will break in production unless you set `NEXT_PUBLIC_APP_URL`**.

### The `NEXT_PUBLIC_APP_URL` chicken-and-egg

You need the deployed URL to set this, but you set env vars before deploying. Do this:
1. Deploy once with `NEXT_PUBLIC_APP_URL` left blank (or a guess).
2. Copy the real URL the host assigns (e.g. `https://tambo-os.vercel.app`).
3. Set `NEXT_PUBLIC_APP_URL` to that URL and **redeploy** (`NEXT_PUBLIC_*` vars are baked in at build time, so a rebuild is required).

---

## 2. Prerequisite service setup

### Clerk (required)
1. Create an application in the Clerk dashboard.
2. **Enable Organizations**: Clerk → **Organizations** → turn on. The app forces every user through `/onboarding` to create an org, so this is mandatory.
3. For production, create a **Production instance** and use the `pk_live_…` / `sk_live_…` keys. Add your deployed domain under Clerk → **Domains**.

### Google OAuth (optional — Gmail/Calendar)
1. Google Cloud Console → create OAuth 2.0 Client ID (type: **Web application**).
2. Enable the **Gmail API** and **Google Calendar API**.
3. Add **Authorized redirect URI**: `https://YOUR_APP_URL/api/auth/google/callback`

### Slack OAuth (optional)
1. api.slack.com/apps → create an app.
2. **OAuth & Permissions** → add **Redirect URL**: `https://YOUR_APP_URL/api/slack/callback`
3. Add the scopes your workspace needs, then install to a workspace.

> Replace `YOUR_APP_URL` with your real deployed domain. Update these redirect URLs whenever the domain changes.

---

## 3. Deploy to Vercel (recommended)

Vercel natively supports Next.js 16 and pnpm — near-zero config.

### Option A — Dashboard
1. Go to [vercel.com/new](https://vercel.com/new) and **Import** the GitHub repo `dudejagarvit887/Task-OS`.
2. Framework preset auto-detects **Next.js**. Leave build/output settings default.
3. Under **Environment Variables**, add every **Required** variable from §1 (and any Optional ones you use). Set them for the **Production** environment.
4. Click **Deploy**.
5. After the first deploy, copy the assigned URL → set `NEXT_PUBLIC_APP_URL` to it → **Redeploy**.
6. Register the Google/Slack redirect URLs (§2) using the final domain.

### Option B — CLI
```bash
npm i -g vercel
vercel            # first deploy (links project)
# add env vars:
vercel env add NEXT_PUBLIC_TAMBO_API_KEY production
# …repeat for each variable…
vercel --prod     # production deploy
```

**Vercel notes**
- No `vercel.json` is needed. Default build command `pnpm build` and Next.js output are auto-detected.
- Set the Node.js version under **Project → Settings → Build → Node.js Version = 20.x** if it defaults to something older.

---

## 4. Deploy to Render (free tier)

Use a **Web Service** (not a Static Site — this app has server routes and middleware).

### Steps (Dashboard)
1. [dashboard.render.com](https://dashboard.render.com) → **New → Web Service** → connect the GitHub repo.
2. Configure:
   - **Runtime:** Node
   - **Build Command:** `corepack enable && pnpm install --frozen-lockfile && pnpm build`
   - **Start Command:** `pnpm start`
   - **Instance Type:** Free
3. **Environment** → add every **Required** variable from §1 (+ Optional). Also add:
   - `NODE_VERSION` = `20`
   - Do **not** set `PORT` — Render injects it and `next start` reads it automatically.
4. Create the service and wait for the first build.
5. Copy the assigned URL (e.g. `https://task-os.onrender.com`) → set `NEXT_PUBLIC_APP_URL` to it → **Manual Deploy → Clear build cache & deploy** (needed because `NEXT_PUBLIC_*` is baked at build time).
6. Register the Google/Slack redirect URLs (§2) with the `.onrender.com` domain.

### Or use the blueprint
Commit the included `render.yaml` (see below) and choose **New → Blueprint** in Render — it fills in build/start commands for you; you still add secret env vars in the dashboard.

**Render free-tier caveats**
- The service **spins down after ~15 min of inactivity**; the next request takes ~30–60s to cold-start.
- Free instances have limited monthly hours and 512 MB RAM. A Next.js build can be memory-heavy — if the build OOMs, that's the free-tier limit; Vercel is the smoother option for this app.

---

## 5. Post-deploy checklist

- [ ] All **Required** env vars set on the host
- [ ] `NEXT_PUBLIC_APP_URL` = the real deployed URL, and app **rebuilt** after setting it
- [ ] Clerk **Organizations enabled**, production keys used, deployed domain added in Clerk
- [ ] Google redirect URI = `https://YOUR_APP_URL/api/auth/google/callback` (if using Gmail/Calendar)
- [ ] Slack redirect URL = `https://YOUR_APP_URL/api/slack/callback` (if using Slack)
- [ ] Sign up → onboarding → dashboard flow works end to end
- [ ] Never commit real keys — `.env*` is gitignored

---

## 6. Quick local run

```bash
pnpm install
cp .env.local .env.local   # already present; fill in the values
pnpm dev                    # http://localhost:3000
```
