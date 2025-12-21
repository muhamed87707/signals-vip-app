// Admin Panel TypeScript Interfaces and Types

// Authentication Types
export interface AuthenticationState {
  isAuthenticated: boolean;
  password: string;
  loginError: string;
  sessionTimeout: number;
}

export interface AuthenticationMethods {
  handleLogin(password: string): Promise<boolean>;
  handleLogout(): void;
  validateSession(): boolean;
  refreshSession(): void;
}

// Tab Management Types
export interface TabState {
  activeTab: 'publish' | 'signals' | 'vip' | 'settings';
  tabCounts: {
    signals: number;
    vip: number;
  };
}

export interface TabMethods {
  switchTab(tabId: string): void;
  updateTabCount(tabId: string, count: number): void;
  preserveTabState(): void;
}

// Image Processing Types
export interface ImageProcessor {
  selectedFile: File | null;
  previewData: string | null;
  isProcessing: boolean;
}

export interface ImageMethods {
  handleFileUpload(file: File): Promise<void>;
  handlePasteImage(event: ClipboardEvent): Promise<void>;
  createBlurredVersion(file: File): Promise<string>;
  compressImage(file: File, quality: number): Promise<File>;
  validateImageFormat(file: File): boolean;
}

// AI Content Generator Types
export interface AIGenerator {
  geminiApiKey: string;
  selectedModel: 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
  postCount: number;
  aiPrompt: string;
  generatedPosts: string[];
  selectedPostIndex: number;
  isGenerating: boolean;
}

export interface AIMethods {
  generatePosts(originalText: string): Promise<string[]>;
  selectPost(index: number): void;
  saveAISettings(): Promise<void>;
  loadAISettings(): Promise<void>;
}

// Signal Type Management
export interface SignalType {
  type: 'vip' | 'free' | 'regular';
  description: string;
  icon: string;
  telegramBehavior: 'blur' | 'clear' | 'normal';
}

export interface SignalTypeManager {
  currentType: SignalType;
  availableTypes: SignalType[];
  setSignalType(type: string): void;
  getTypeConfiguration(type: string): SignalType;
}

// Telegram Integration Types
export interface TelegramOptions {
  postToTelegram: boolean;
  buttonType: 'view_signal' | 'share' | 'subscribe' | 'none';
  customMessage?: string;
}

export interface TelegramMethods {
  sendSignalToTelegram(signal: Signal, options: TelegramOptions): Promise<boolean>;
  createInlineKeyboard(buttonType: string): any;
  processImageForTelegram(image: File, isVIP: boolean): Promise<string>;
}

// Data Models
export interface Signal {
  _id: string;
  pair: string;
  type: 'SIGNAL' | 'REGULAR';
  imageUrl: string;
  telegramImage?: string;
  customPost?: string;
  isVip: boolean;
  sendToTelegram: boolean;
  telegramButtonType: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    originalFileName?: string;
    imageSize?: number;
    processingTime?: number;
  };
}

export interface VIPUser {
  _id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  isVip: boolean;
  isLifetime: boolean;
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
  durationMonths?: number;
  createdAt: Date;
  lastActivity?: Date;
}

export interface AdminSettings {
  _id: string;
  geminiApiKey: string;
  selectedModel: string;
  aiPrompt: string;
  generatedPostCount: number;
  defaultSignalType: string;
  telegramSettings: {
    defaultPostToTelegram: boolean;
    defaultButtonType: string;
  };
  uiSettings: {
    theme: 'dark' | 'light';
    language: 'ar' | 'en';
    autoSave: boolean;
  };
}

// Error Messages Types
export interface ErrorMessages {
  ar: {
    networkError: string;
    imageUploadError: string;
    aiGenerationError: string;
    saveError: string;
    telegramError: string;
  };
  en: {
    networkError: string;
    imageUploadError: string;
    aiGenerationError: string;
    saveError: string;
    telegramError: string;
  };
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SignalResponse extends APIResponse {
  signals?: Signal[];
}

export interface UserResponse extends APIResponse {
  users?: VIPUser[];
}

export interface SettingsResponse extends APIResponse {
  settings?: AdminSettings;
}

// Component Props Types
export interface AdminPanelProps {
  initialLanguage?: 'ar' | 'en';
  theme?: 'dark' | 'light';
}

export interface TabComponentProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabCounts: TabState['tabCounts'];
}

export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImagePaste: (event: ClipboardEvent) => void;
  previewData?: string | null;
  isUploading?: boolean;
}

export interface AIGeneratorProps {
  settings: AIGenerator;
  onSettingsChange: (settings: Partial<AIGenerator>) => void;
  onGenerate: (text: string) => Promise<void>;
}

// Utility Types
export type TabId = 'publish' | 'signals' | 'vip' | 'settings';
export type SignalTypeId = 'vip' | 'free' | 'regular';
export type TelegramButtonType = 'view_signal' | 'share' | 'subscribe' | 'none';
export type GeminiModel = 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';

// Event Handler Types
export type ImageUploadHandler = (file: File) => Promise<void>;
export type ImagePasteHandler = (event: ClipboardEvent) => Promise<void>;
export type TabChangeHandler = (tabId: TabId) => void;
export type SignalTypeChangeHandler = (type: SignalTypeId) => void;
export type AIGenerateHandler = (text: string) => Promise<string[]>;
export type SettingsSaveHandler = (settings: Partial<AdminSettings>) => Promise<void>;

// Form Data Types
export interface SignalFormData {
  imageFile?: File;
  customPost: string;
  signalType: SignalTypeId;
  postToTelegram: boolean;
  telegramButtonType: TelegramButtonType;
}

export interface VIPFormData {
  telegramId: string;
  durationMonths: number;
  isLifetime: boolean;
}

export interface AISettingsFormData {
  geminiApiKey: string;
  selectedModel: GeminiModel;
  postCount: number;
  aiPrompt: string;
}