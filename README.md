# LocalPRO Realty, Listing Pipeline

A listing-intake → automated-actions → pipeline-tracker app built for LocalPRO Realty. Submit a property once; the app notifies the team,
drafts MLS / social / email copy with Groq, and schedules the media shoot, all visible on a real-time Kanban board.

> **Built for the "how you think" brief.** See [DECISIONS.md](./DECISIONS.md) for the
> tradeoffs I made and what I'd build next.

## Stack
- Next.js 14
- Tailwind CSS
- `groq-sdk`: marketing copy via `llama-3.3-70b-versatile`
- `resend`: team email notifications
- React Context + `localStorage` for state (no database)

## Run locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables
All are optional. Without them the app runs in *simulated* mode, automations still fire, log entries still appear, and realistic stub copy is returned.

```env
GROQ_API_KEY=
RESEND_API_KEY=
TEAM_EMAIL=team@example.com
```

Copy `.env.example` to `.env.local` when you're ready to wire in real keys.