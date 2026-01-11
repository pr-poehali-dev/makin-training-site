const API_URLS = {
  auth: 'https://functions.poehali.dev/8cfbd030-d178-4ffd-983d-f0bfbfe81900',
  purchases: 'https://functions.poehali.dev/f3dbdaa0-85d9-4b97-948f-7680f50789a6',
  trainingLog: 'https://functions.poehali.dev/60d26fc8-76c5-4ea0-a64b-00a5192fe9a2'
};

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
}

export interface TrainingLog {
  id?: number;
  user_id: number;
  date: string;
  program_id?: string;
  exercise_name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

export const api = {
  async register(email: string, password: string, name: string, phone: string): Promise<{ user: User }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, name, phone })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка регистрации');
    }
    
    return response.json();
  },

  async login(email: string, password: string): Promise<{ user: User }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка входа');
    }
    
    return response.json();
  },

  async savePurchases(userId: number, programs: any[]): Promise<void> {
    const response = await fetch(API_URLS.purchases, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, programs })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка сохранения покупок');
    }
  },

  async getPurchases(userId: number): Promise<any[]> {
    const response = await fetch(`${API_URLS.purchases}?user_id=${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки покупок');
    }
    
    const data = await response.json();
    return data.purchases;
  },

  async getTrainingLogs(userId: number): Promise<TrainingLog[]> {
    const response = await fetch(`${API_URLS.trainingLog}?user_id=${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки дневника');
    }
    
    const data = await response.json();
    return data.logs;
  },

  async addTrainingLog(log: TrainingLog): Promise<void> {
    const response = await fetch(API_URLS.trainingLog, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка добавления записи');
    }
  },

  async updateTrainingLog(log: TrainingLog): Promise<void> {
    const response = await fetch(API_URLS.trainingLog, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка обновления записи');
    }
  }
};
