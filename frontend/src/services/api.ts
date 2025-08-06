const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://octopus-app-4psfy.ondigitalocean.app/api';

export interface User {
  id: number;
  login: string;
  turma: string;
  escola: string;
  xp_atual: number;
  erros: number;
  id_q1: number;
  id_q2: number;
  id_q3: number;
  id_q4: number;
  response_q1: boolean;
  response_q2: boolean;
  response_q3: boolean;
  response_q4: boolean;
}

export interface Question {
  id: number;
  pergunta: string;
  imagem?: string;
  dica: string;
  a1: string;
  a2: string;
  a3: string;
  a4: string;
  a5: string;
  ac: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AvailableQuestionsResponse {
  questions: Question[];
  nextHint?: string;
  currentDay?: number;
  maxDays?: number;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge headers from options
    if (options.headers) {
      if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
        Object.assign(headers, options.headers);
      }
    }

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(login: string, senha: string): Promise<LoginResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, senha }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyToken(): Promise<User> {
    return this.request('/auth/verify');
  }

  async getAvailableQuestions(): Promise<AvailableQuestionsResponse> {
    return this.request('/questions/available');
  }

  async answerQuestion(questionId: number, answer: number): Promise<{ success: boolean; isCorrect: boolean; xpGained: number; message: string; nextHint?: string; isAtrasada?: boolean }> {
    return this.request('/questions/answer', {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async getUserProfile(): Promise<User> {
    return this.request('/users/profile');
  }

  async getClassRanking(): Promise<any[]> {
    return this.request('/ranking/turmas');
  }

  async getTop3Classes(): Promise<{ success: boolean; top3: any[] }> {
    return this.request('/ranking/top3');
  }

  async getClassPosition(turma: string, escola: string): Promise<{ success: boolean; turma: { posicao: number; mediaXp: number } }> {
    return this.request(`/ranking/turma/${encodeURIComponent(turma)}/${encodeURIComponent(escola)}`);
  }

  async getClassDetails(): Promise<{ success: boolean; turma: any; estudantes: any[] }> {
    return this.request('/ranking/minha-turma');
  }

  async getNextQuestionInfo(): Promise<{
    success: boolean;
    hasNextQuestion: boolean;
    nextDay?: number;
    nextQuestion?: {
      id: number;
      pergunta: string;
      dica: string;
    };
    timeUntilNext?: {
      hours: number;
      minutes: number;
      totalSeconds: number;
    };
    message?: string;
  }> {
    return this.request('/questions/next-question-info');
  }

  async getUserPosition(): Promise<{ success: boolean; user: { posicao: number; totalUsuarios: number; xp: number; nivel: number } }> {
    return this.request('/ranking/user-position');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
}

export const apiService = new ApiService(); 