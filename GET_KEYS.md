# Getting every API key & credential (step by step)

This walks you click-by-click through obtaining every environment variable in `.env.local`. Do the **Required** ones (Tambo + Clerk) to get the app running; do the **Optional** ones only if you want that integration.

When a step says `YOUR_APP_URL`, use:
- **Local:** `http://localhost:3000`
- **Production:** your deployed URL, e.g. `https://tambo-os.vercel.app` or `https://task-os.onrender.com`

Add **both** the localhost and production URLs everywhere a redirect/callback is asked for, so it works in dev and prod.

---

## 1. Tambo AI  — `NEXT_PUBLIC_TAMBO_API_KEY`  (REQUIRED)

1. Go to **https://console.tambo.co**.
2. Sign in (GitHub / Google / email). Verify your email if prompted.
3. You land on a project. If none exists, click **Create Project** and name it (e.g. `tambo-os`).
4. In the left sidebar open **API Keys** (may be under **Settings → API Keys**).
5. Click **Create API Key** → give it a name → **Create**.
6. **Copy the key immediately** (it's shown once).
7. Paste it into:
   ```
   NEXT_PUBLIC_TAMBO_API_KEY=<paste here>
   ```

> Nothing to "enable" for Tambo — the key alone powers the chat/generative-UI.

---

## 2. Clerk (auth)  — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`  (REQUIRED)

### 2a. Create the application & get keys
1. Go to **https://dashboard.clerk.com** and sign up / sign in.
2. Click **Create application**.
3. Name it (e.g. `Tambo OS`). Under **Sign-in options** enable at least **Email**; you can also toggle **Google** etc.
4. Click **Create application**.
5. You're taken to a **Quickstart / API Keys** page showing:
   - **Publishable key** → starts with `pk_test_…`
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
     ```
   - **Secret key** → click reveal → starts with `sk_test_…`
     ```
     CLERK_SECRET_KEY=sk_test_…
     ```

### 2b. Enable Organizations  ← IMPORTANT, the app breaks without this
The app forces every new user through `/onboarding` to create a workspace (a Clerk **Organization**). You must turn this on:
1. In the left sidebar click **Organizations** (sometimes under **Configure → Organization Management**).
2. Toggle **Enable Organizations** → **On**.
3. (Recommended) enable **Allow users to create organizations** so onboarding can create one.

### 2c. Leave these fixed values as-is
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding
```

### 2d. Dev vs Production keys
- The `pk_test_…` / `sk_test_…` (Development) keys **work on any domain** (including your Vercel/Render URL) and are perfect for a hackathon demo — you'll just see a small "development mode" banner and there are usage limits.
- For a real production launch: in Clerk create a **Production instance**, add your domain under **Domains**, and use the `pk_live_…` / `sk_live_…` keys instead.

---

## 3. Google OAuth — Gmail + Calendar  (OPTIONAL)
`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`

The app requests these scopes: `gmail.readonly` (read email) and `calendar` (full calendar read/write).

### 3a. Create a project
1. Go to **https://console.cloud.google.com**.
2. Top bar → project dropdown → **New Project** → name it → **Create** → select it.

### 3b. Enable the two APIs  ← the "what to enable"
1. Left menu → **APIs & Services → Library**.
2. Search **Gmail API** → open → **Enable**.
3. Back to Library → search **Google Calendar API** → open → **Enable**.

### 3c. Configure the OAuth consent screen
1. **APIs & Services → OAuth consent screen**.
2. User type: **External** → **Create**.
3. Fill **App name**, **User support email**, **Developer contact email** → **Save and Continue**.
4. **Scopes** step: you can click **Save and Continue** (the app sends scopes at login time). Optionally **Add or Remove Scopes** and add `.../auth/gmail.readonly` and `.../auth/calendar`.
5. **Test users** step: click **Add Users** and add **your own Google email** (and any teammate testing). While the app is in **Testing** mode, only listed test users can log in — but it works without Google's full verification. → **Save and Continue**.

### 3d. Create the OAuth client ID → get the keys
1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**. Name it (e.g. `tambo-os-web`).
3. Under **Authorized redirect URIs** click **Add URI** and add **both**:
   ```
   http://localhost:3000/api/auth/google/callback
   https://YOUR_APP_URL/api/auth/google/callback
   ```
4. Click **Create**. A dialog shows:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client secret** → `GOOGLE_CLIENT_SECRET`

---

## 4. Slack  (OPTIONAL)
`SLACK_CLIENT_ID` + `SLACK_CLIENT_SECRET`

The app requests these scopes: `channels:history`, `channels:read`, `groups:history`, `groups:read`, `users:read`, `team:read`.

1. Go to **https://api.slack.com/apps** → **Create New App** → **From scratch**.
2. Name it (e.g. `Tambo OS`), pick your **workspace** → **Create App**.
3. Left sidebar → **OAuth & Permissions**:
   - Under **Redirect URLs** → **Add New Redirect URL** → add **both**:
     ```
     http://localhost:3000/api/slack/callback
     https://YOUR_APP_URL/api/slack/callback
     ```
     → **Save URLs**.
   - Under **Scopes → Bot Token Scopes** click **Add an OAuth Scope** and add each:
     `channels:history`, `channels:read`, `groups:history`, `groups:read`, `users:read`, `team:read`.
4. Left sidebar → **Basic Information → App Credentials**:
   - **Client ID** → `SLACK_CLIENT_ID`
   - **Client Secret** (click **Show**) → `SLACK_CLIENT_SECRET`
5. (Optional) Click **Install to Workspace** to authorize it once for testing.

---

## 5. Inworld — voice / text-to-speech  (OPTIONAL)
`NEXT_PUBLIC_INWORLD_API_KEY`

The app calls `https://api.inworld.ai/tts/v1/voice:stream` with an HTTP header `Authorization: Basic <key>`, so this variable must be the **Base64 runtime key** Inworld gives you (already Base64-encoded — paste it as-is, no extra encoding).

1. Go to **https://studio.inworld.ai** and sign up / sign in.
2. Create or select a **Workspace**.
3. Open **Integrations / API Keys** (in workspace settings).
4. Create a **Runtime API Key**. Inworld shows a **Base64 authorization string** (an encoded `key:secret`).
5. Copy that Base64 string into:
   ```
   NEXT_PUBLIC_INWORLD_API_KEY=<paste the Base64 string>
   ```

> If you don't need voice, leave this blank — the rest of the app runs fine; only the mic / TTS features are disabled.

---

## 6. Where you paste all of this

- **Local development:** into the `.env.local` file in the project root (already created for you, and gitignored).
- **Vercel:** Project → **Settings → Environment Variables** (add each key/value, Production scope) → redeploy.
- **Render:** Service → **Environment** tab (add each key/value) → redeploy.

Remember the two production gotchas from `DEPLOY.md`:
1. Set `NEXT_PUBLIC_APP_URL` to your real deployed URL, then **rebuild** (these `NEXT_PUBLIC_*` values are baked in at build time).
2. Every redirect/callback URL above must include your **production** domain, not just localhost.

### Final env checklist
| Variable | Required? | From |
|---|---|---|
| `NEXT_PUBLIC_TAMBO_API_KEY` | ✅ | console.tambo.co → API Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk → API Keys |
| `CLERK_SECRET_KEY` | ✅ | Clerk → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | fixed: `sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | fixed: `sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | ✅ | fixed: `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | ✅ | fixed: `/onboarding` |
| `NEXT_PUBLIC_APP_URL` | ✅ | your deployed URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ⬜ | Google Cloud Console |
| `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET` | ⬜ | api.slack.com/apps |
| `NEXT_PUBLIC_INWORLD_API_KEY` | ⬜ | studio.inworld.ai |
