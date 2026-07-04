export interface Attraction {
  name: string;
  location: string;
  description: string;
  culturalSignificance: string;
  heritageStory: string;
  audioGuideDraft: string;
}

export interface HiddenGem {
  name: string;
  location: string;
  description: string;
  whySecret: string;
  culturalSignificance: string;
  visitingTips: string;
}

export interface HeritageTradition {
  title: string;
  category: string;
  description: string;
  howToExperience: string;
}

export interface CulturalEvent {
  name: string;
  timeOfYear: string;
  description: string;
  culturalMeaning: string;
  travelerTip: string;
}

export interface ItineraryDay {
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
  localVibeTip: string;
}

export interface DestinationInfo {
  destination: string;
  country: string;
  tagline: string;
  overview: string;
  heritageSummary: string;
  attractions: Attraction[];
  hiddenGems: HiddenGem[];
  heritageAndTraditions: HeritageTradition[];
  events: CulturalEvent[];
  itinerary: ItineraryDay[];
}

export interface GuideProfile {
  city: string;
  name: string;
  role: string;
  avatarSeed: string;
  bio: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}
