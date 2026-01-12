
export enum ProjectStep {
  IDEATION = 'ideation',
  SCRIPT = 'script',
  THUMBNAIL = 'thumbnail',
  METADATA = 'metadata'
}

export interface TitleIdea {
  id: string;
  title: string;
  tags: string[];
  ctrScore: 'High' | 'Trending' | 'Optimized' | 'Panic';
}

export interface Project {
  id: string;
  name: string;
  niche: string;
  baseTheme: string;
  createdAt: string;
  titles: TitleIdea[];
  script: string;
  thumbnails: string[];
  targetAudience: string;
  emotionalTrigger: string;
  format: string;
  scriptPrompt?: string;
  negativeInstructions?: string;
  positiveInstructions?: string;
  description?: string;
  chapters?: string;
}

export interface TrendSource {
  title: string;
  uri: string;
}

export interface Trend {
  id: string;
  topic: string;
  reason: string;
  viralScore: number;
  marketGap: string;
  sources: TrendSource[];
}

export interface UserState {
  credits: number;
  plan: 'Free' | 'Pro' | 'Agency';
  projects: Project[];
}
