export type PipelineStage =
  | "new"
  | "content_generated"
  | "media_scheduled"
  | "review"
  | "live";

export type AutomationType = "notification" | "marketing" | "media_schedule";

export type AutomationStatus = "pending" | "running" | "completed" | "failed";

export interface AutomationLog {
  id: string;
  type: AutomationType;
  status: AutomationStatus;
  timestamp: string;
  details: string;
}

export interface MarketingContent {
  mlsDescription: string;
  socialCaption: string;
  emailBlast: string;
  generatedAt: string;
  simulated?: boolean;
}

export interface MediaSchedule {
  photographerDate: string;
  videoTourDate: string;
  droneDate?: string;
  scheduledAt: string;
}

export interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  photos: string[];
  stage: PipelineStage;
  createdAt: string;
  updatedAt: string;
  automations: AutomationLog[];
  marketingContent?: MarketingContent;
  mediaSchedule?: MediaSchedule;
}

export type NewListingInput = Omit<
  Listing,
  "id" | "stage" | "createdAt" | "updatedAt" | "automations"
>;
