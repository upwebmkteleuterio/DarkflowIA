
export enum ProjectStep {
  IDEATION = 'ideation',
  SCRIPT = 'script',
  THUMBNAIL = 'thumbnail',
  METADATA = 'metadata',
  EXPORT = 'export'
}

export type ScriptMode = 'manual' | 'winner' | 'auto';

export interface ScriptItem {
  id: string;
  title: string;
  script: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  thumbnails: string[];
  description?: string;
  chapters?: string;
}

export interface Project {
  id: string;
  name: string;
  niche: string;
  baseTheme: string;
  targetAudience: string;
  createdAt: string;
  items: ScriptItem[];
  globalTone: string;
  globalRetention: string;
  globalDuration: number;
  thumbnails: string[];
  scriptMode: ScriptMode;
  winnerTemplate?: string;
  script?: string;
  scriptPrompt?: string;
  positiveInstructions?: string;
  negativeInstructions?: string;
}

export interface TitleIdea {
  id: string;
  title: string;
  tags: string[];
  ctrScore: 'High' | 'Trending' | 'Optimized' | 'Panic';
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
