export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  instagram: string;
  email: string;
  status: RequestStatus;
  qrCode?: string;
  isUsed: boolean;
  usedAt?: number;
  createdAt: number;
  invitedBy?: string;
  promoterCode?: string;
}

export interface LevelConfig {
  level: number;
  threshold: number; 
  reward: string;    
}

export interface Promoter {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  invites_count: number;
  current_level: number;
  rewards_config: string;
}

export interface ScanResult {
  valid: boolean;
  guest?: Guest;
  promoter?: Promoter;
  message: string;
  type: 'success' | 'error' | 'warning' | 'promoter';
}

export type DesignStyle = 'glass' | 'minimal' | 'brutal' | 'soft';
export type BackgroundType = 'dots' | 'grid' | 'liquid';

export interface AppSettings {
  // Evento
  eventName: string;
  eventSubtitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  enableLocation: string;
  eventDescription: string;
  instagramUrl: string;
  enablePromoterCode: string;

  // Grafica
  designStyle: DesignStyle; 
  bgType: BackgroundType;
  bgColor: string;
  bgDotColor: string;
  bgDotActiveColor: string; 
  primaryColor: string; 
  secondaryColor: string;
  accentColor: string;  
  buttonColor: string;

  // Limiti
  maxGuests: string;
  maxPromoters: string;
}