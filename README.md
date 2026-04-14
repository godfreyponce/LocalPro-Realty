# LocalPRO Pipeline

A listing-intake → automated-actions → pipeline-tracker app built for the
LocalPRO Realty take-home. Submit a property once; the app notifies the team,
drafts MLS / social / email copy with Claude, and schedules the media shoot —
all visible on a real-time Kanban board.

## Stack
- Next.js 14 (App Router, TypeScript, `src/`)
- Tailwind CSS with a navy + gold theme, DM Sans + Playfair Display
- `@anthropic-ai/sdk` — marketing copy via `claude-sonnet-4-5`
- `resend` — team email notifications
- React Context + `localStorage` for state (no database)

## Run locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables
All are optional. Without them the app runs in *simulated* mode — automations
still fire, log entries still appear, and realistic stub copy is returned.

```env
ANTHROPIC_API_KEY=
RESEND_API_KEY=
TEAM_EMAIL=team@example.com
```

Copy `.env.example` to `.env.local` when you're ready to wire in real keys.

## Flow
1. Submit a listing at `/intake`.
2. Dashboard redirect; three automations fire sequentially with staggered
   delays so the Activity Log animates in real time:
   - **Team notification** → POST `/api/notify-team` (Resend or simulated).
   - **AI marketing copy** → POST `/api/generate-marketing` (Claude or stub).
   - **Media scheduling** → client-side business-day math (drone added when
     price > \$500k).
3. Click a listing card to inspect marketing content, the media schedule, and
   the full activity log.
4. Advance manually through *Review* → *Live* to complete the pipeline.

## Deploy to Vercel
```bash
vercel login
vercel            # link project
# Add env vars in the Vercel dashboard, then:
vercel --prod
```
