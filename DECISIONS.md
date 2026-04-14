# Decisions

The brief said *"we are not looking for perfection, we are looking for how you think."*
This is that document.

## What I built

A listing operations system modeled as a state machine, not a form.

**Intake** captures a property once. Submitting kicks off a sequence of real
automations you can watch fire on a Kanban board:

1. **Team notification:** Resend (email platform) sends a branded email to the listing team with the address, price, beds/baths/sqft, agent notes, and a link back to the pipeline. Subject line is parseable at a glance:
   `[New Listing] 123 Lakeview Dr, Austin TX - $725,000`.
2. **AI marketing draft:** Groq's `llama-3.3-70b-versatile` (with JSON mode) turns the agent's raw notes into polished MLS copy, a social caption, and an email blast. All three are one click copyable.
3. **Media scheduling:** I used business day math which books the photographer, video tour, and (for $500k+ listings) drone. This fires *after* a human approves the marketing copy, not automatically. More on that below.

Progress moves through `New → Content Generated → Media Scheduled →
Review → Live`. Every state change is logged with a timestamp and
surfaced in a per-listing activity feed.

## What I traded off

**Automations fire client-side, not through a queue.** A production
version would be Inngest or a Supabase edge function with retry and
dead-letter handling. I chose client-side orchestration because the
brief is a 5-minute Loom, the evaluator has to see the automations
fire. A background queue is invisible. Trade-off I'd reverse on day one
of real traffic.

**Media scheduling does not auto fire after AI marketing.** I originally
chained it. Then I realized that would ship copy the agent hadn't read
to the calendar of a photographer who costs real money. The stage gate
between `content_generated` and `media_scheduled` is a *feature*:
automation should augment judgment, not replace it. The intake form
copy says this explicitly now.

**localStorage instead of a database.** The evaluator should be able to
clone, `npm install`, `npm run dev`, and have a working pipeline in 30
seconds. No Postgres, no auth, no seed script. The `ListingContext` API
is already shaped like a repository, swapping the storage layer for
Supabase is a one-afternoon refactor.

**No mocks for the AI call or the email send.** Both integrations have
graceful *simulated* modes when API keys are missing (labeled as such in
the activity log), but with keys configured they hit real infrastructure.
I wanted the Loom to show a real `Groq Llama 3.3 70B` response, not a
stub.

**`$500k` as the drone threshold is a magic number.** It lives in
`src/lib/constants.ts` and could be a per-team setting. Not worth the
config surface for a demo.

## What I'd do with a week

- **Supabase + Auth.** Drop `ListingContext`'s localStorage layer for a
  real DB. Row level security so each agent sees only their own
  listings. This is the unblocker for everything below.
- **Stage transitions as triggers.** Moving a listing to `live` should
  fire a "congratulations, here's your MLS upload checklist" email.
  Moving to `review` should ping the compliance reviewer on Slack.
  Right now stage advancement is just state, it should be an event bus.
- **Inbound webhooks.** MLS vendors (Zillow, Follow Up Boss, the listing syndicator LocalPRO uses) push new listings via webhook. Turn intake into an `/api/webhook/listing` endpoint and the agent never types the form.
- **Twilio SMS to the listing agent.** "Your shoot with Maria is booked
  for Thursday 2pm. Reply YES to confirm." Closes the media-scheduling
  loop with a touchpoint the agent is already checking.
- **Per-listing media vendor picker.** Right now the photographer is
  abstract. Store a roster of preferred vendors per market, pick based
  on price tier and availability, and send that vendor the brief.
- **Roll-up analytics on the pipeline.** Average time in each stage, %
  of listings that stall at `review`, copy approval rate. The Kanban is
  already the data model, the dashboard is one SQL query away.

## What the stack says about how I think

- **Next.js App Router + TypeScript end-to-end** because the API routes, the intake form, and the Kanban share types. One source of truth for the `Listing` shape across client, server, and the email HTML.
- **Real AI via Groq's SDK, not a mock.** If the pitch is "AI helps
  agents move faster," the demo has to actually call the model. I chose
  Groq over the hosted model providers because it's fast (sub-second
  token-level latency on Llama 3.3 70B) and has a free tier, an
  evaluator can run the app end-to-end without ever touching a credit
  card. Swapping to OpenAI or Anthropic is a two-line change.
- **Graceful simulation mode.** A reviewer with no API keys should still
  be able to see automations fire. The activity log labels simulated
  runs honestly. This is defensive design, and it's also the reason I
  can confidently deploy to Vercel without shipping you my API bill.
- **Brand-matched UI.** Montserrat + LocalPRO Realty's navy (`#1b324e`) and gold (`#dbae77`) pulled straight from localprorealty.com. The detail is small. The signal, that I pay attention, is not.
