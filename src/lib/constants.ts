import type { PipelineStage } from "./types";

export const PIPELINE_STAGES: PipelineStage[] = [
  "new",
  "content_generated",
  "media_scheduled",
  "review",
  "live",
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "New Listing",
  content_generated: "Content Generated",
  media_scheduled: "Media Scheduled",
  review: "Review",
  live: "Live",
};

export const STAGE_DESCRIPTIONS: Record<PipelineStage, string> = {
  new: "Just submitted",
  content_generated: "Marketing copy ready",
  media_scheduled: "Photo/video booked",
  review: "Awaiting approval",
  live: "On the market",
};

export const DRONE_PRICE_THRESHOLD = 500_000;

export const DEFAULT_TEAM_EMAIL = "team@localpro.example";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export const MARKETING_PROMPT = `You are a luxury real estate marketing copywriter. Given the following property details, generate:
1. MLS_DESCRIPTION: A professional 150-word MLS listing description that highlights key selling points and uses power words that drive buyer interest.
2. SOCIAL_CAPTION: An Instagram/Facebook caption (under 200 chars) with relevant emoji and 3 hashtags.
3. EMAIL_BLAST: A short email body (3 paragraphs) for a "Just Listed" email campaign targeting potential buyers in the area.

Return ONLY valid JSON with keys: mlsDescription, socialCaption, emailBlast. No markdown fences, no commentary.`;
