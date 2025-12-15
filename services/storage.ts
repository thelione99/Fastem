import { Guest, RequestStatus, ScanResult, Promoter, LevelConfig, AppSettings } from '../types';

const apiCall = async <T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> => {
  try {
    const token = sessionStorage.getItem('russoloco_admin_auth') || '';
    const headers: HeadersInit = { 'Content-Type': 'application/json', 'x-admin-password': token };
    const config: RequestInit = { method, headers, body: body ? JSON.stringify(body) : undefined };
    const response = await fetch(`/api/${endpoint}`, config);
    if (!response.ok) {
      if (response.status === 401) {
          sessionStorage.removeItem('russoloco_admin_auth');
          window.location.reload();
          return null as T;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Errore API: ${response.status}`);
    }
    if (response.status === 204) return null as T;
    return await response.json();
  } catch (error) { console.error(`Errore ${endpoint}:`, error); throw error; }
};

export const getGuests = async (): Promise<Guest[]> => { return await apiCall<Guest[]>('guests'); };
export const createRequest = async (guestData: any): Promise<void> => { await apiCall('register', 'POST', guestData); };
export const approveRequest = async (id: string): Promise<Guest | null> => { const response = await apiCall<{ success: boolean, guest: Guest }>('approve', 'POST', { id }); return response.guest; };
export const rejectRequest = async (id: string): Promise<void> => { await apiCall('reject', 'POST', { id }); };

// NUOVE FUNZIONI AGGIUNTE
export const deleteGuest = async (id: string): Promise<void> => { await apiCall('delete-guest', 'POST', { id }); };
export const manualCheckIn = async (id: string): Promise<void> => { await apiCall('manual-checkin', 'POST', { id }); };

export const updateGuest = async (data: { id: string; firstName: string; lastName: string; email: string; instagram: string }): Promise<void> => {
  await apiCall('update-guest', 'POST', data);
};

// AGGIUNGI QUESTA NUOVA FUNZIONE
export const resendQREmail = async (id: string): Promise<void> => {
  await apiCall('resend-qr', 'POST', { id });
};

export const scanQRCode = async (qrContent: string): Promise<ScanResult> => { try { return await apiCall<ScanResult>('scan', 'POST', { qrContent }); } catch (error) { return { valid: false, message: 'ERRORE DI RETE', type: 'error' }; } };
export const resetData = async (): Promise<void> => { await apiCall('reset', 'POST'); };
export const getPromoters = async (): Promise<Promoter[]> => { return await apiCall<Promoter[]>('admin/promoters'); };
export const createPromoter = async (data: { firstName: string; lastName: string; code: string; password: string; rewardsConfig: LevelConfig[] }): Promise<void> => { await apiCall('admin/create-promoter', 'POST', data); };
export const getSettings = async (): Promise<AppSettings> => { return await apiCall<AppSettings>('settings'); };
export const updateSettings = async (settings: AppSettings): Promise<void> => { await apiCall('admin/settings', 'POST', settings); };