// Authentication Types
export type UserRole = 'super_admin' | 'family_admin' | 'family_co_admin' | 'family_user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  family_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
  message: string;
}

export interface MagicLinkResponse {
  message: string;
  email: string;
  status: string;
  note: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  verifyMagicLink: (email: string, token: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Family Types
export interface Family {
  id: string;
  family_name: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  name: string;
  photo_url?: string;
  relationships: Record<string, string>;
  custom_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: string;
  error?: string;
}
