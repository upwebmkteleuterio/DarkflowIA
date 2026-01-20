
export enum ProjectStep {
  IDEATION = 'ideation',
  SCRIPT = 'script',
  THUMBNAIL = 'thumbnail',
  METADATA = 'metadata',
  EXPORT = 'export'
}

export type ScriptMode = 'auto' | 'manual' | 'winner';

export interface ScriptItem {
  id: string;
  title: string;
  script: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  thumbStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  thumbPrompt?: string;
  thumbMode?: 'auto' | 'manual';
  error?: string;
  thumbnails: string[];
  description?: string;
  chapters?: string;
  tags?: string;
  voiceStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  voiceName?: string;
  audioUrl?: string;
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
  positiveInstructions?: string;
  negativeInstructions?: string;
  // Campos adicionados para suportar o hook useScript legado
  script?: string;
  scriptPrompt?: string;
}

export interface TitleIdea {
  id: string;
  title: string;
  tags: string[];
  ctrScore: 'High' | 'Trending' | 'Optimized' | 'Panic';
}

export interface Trend {
  id: string;
  topic: string;
  reason: string;
  viralScore: number;
  marketGap: string;
  sources: { title: string; uri: string }[];
}
