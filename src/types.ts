export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  provider: 'email' | 'google' | 'apple';
  joinedAt: string;
  googleAccessToken?: string;
}

export interface PromptItem {
  id: string;
  text: string;
  isSystem: boolean; // default guidelines prompts vs custom prompt
  category?: string;
  tag?: string;
}

export interface GenerationRecord {
  id: string;
  userId: string;
  originalPrompt: string;
  processedPrompt: string; // prefixed with "8k yüksek çözünürlüklü-..."
  imageUrl: string; // Generated canvas seed or high-quality procedural pattern URL
  referenceImages: string[]; // up to 5 base64/placeholder reference files
  editImage?: string; // 1 edit file
  modelUsed: 'Nano Banana Pro' | 'Nano Banana 2' | 'Fallback AI';
  modelSteps: { step: string; status: 'success' | 'attempt' | 'failed'; detail: string }[];
  resolutionSelected?: '1k' | '2k' | '4k';
  isFavorite: boolean;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  text: string;
  type: 'info' | 'forgot_password' | 'system' | 'backup';
  isRead: boolean;
  createdAt: string;
  email?: string; // for password resets
}

export interface AppStateData {
  users: User[];
  defaultPrompts: PromptItem[];
  generations: GenerationRecord[];
  notifications: SystemNotification[];
  adminPassword: string;
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  palette: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate';
  lang: 'tr' | 'en';
}
