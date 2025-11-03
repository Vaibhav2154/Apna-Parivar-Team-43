// API service for authentication - communicates only with FastAPI backend
import { AuthResponse, UserProfile } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface MagicLinkRequest {
  email: string;
}

interface MagicLinkVerificationRequest {
  email: string;
  token: string;
}

// Helper function to add auth token to headers
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Send magic link to email
export async function sendMagicLink(email: string): Promise<{ message: string; email: string; status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email } as MagicLinkRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send magic link');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Verify magic link token and get JWT
export async function verifyMagicLink(email: string, token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token } as MagicLinkVerificationRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to verify magic link');
    }

    const data = await response.json();
    return data as AuthResponse;
  } catch (error) {
    throw error;
  }
}

// Get current user profile
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Verify token validity
export async function verifyToken(token: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Logout - clear local storage
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}
