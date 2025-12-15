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
  bgColor: string;      // Sfondo
  bgDotColor: string;   // Punti Sfondo (NUOVO)
  primaryColor: string; 
  secondaryColor: string;
  accentColor: string;  
  buttonColor: string;  // Pulsanti

  // Limiti
  maxGuests: string;
  maxPromoters: string;
}