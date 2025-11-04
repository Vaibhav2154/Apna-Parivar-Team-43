// New authentication service for the redesigned auth system
import {
  AuthResponse,
  UserProfile,
  AdminOnboardingRequest,
  AdminOnboardingResponse,
  PendingRequestsResponse,
  PendingAdminRequest,
  AdminApprovalRequest,
  FamilyMemberLoginRequest
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// ==================== SUPERADMIN AUTH ====================

export async function superAdminLogin(
  username: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'SuperAdmin login failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ==================== FAMILY ADMIN AUTH ====================

export async function adminRegister(
  request: AdminOnboardingRequest
): Promise<AdminOnboardingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Admin registration failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function adminLogin(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Admin login failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function checkAdminStatus(requestId: string): Promise<AdminOnboardingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to check admin status');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ==================== FAMILY MEMBER AUTH ====================

export async function familyMemberLogin(
  request: FamilyMemberLoginRequest
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/member/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Family member login failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ==================== SUPERADMIN MANAGEMENT ====================

export async function getPendingRequests(): Promise<PendingRequestsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/requests/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch pending requests');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getAllRequests(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  requests: PendingAdminRequest[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/requests/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch all requests');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function approveAdminRequest(
  requestId: string
): Promise<{ message: string; status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/request/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        request_id: requestId,
        action: 'approve',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to approve request');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function rejectAdminRequest(
  requestId: string,
  rejectionReason: string
): Promise<{ message: string; status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/request/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        request_id: requestId,
        action: 'reject',
        rejection_reason: rejectionReason,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reject request');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ==================== TOKEN MANAGEMENT ====================

export async function verifyToken(token: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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

export async function logout(): Promise<{ message: string; status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
