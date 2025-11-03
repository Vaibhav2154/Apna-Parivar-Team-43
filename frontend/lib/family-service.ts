// API service for families management
import { Family, FamilyMember } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// Get all families (SuperAdmin only)
export async function getAllFamilies(): Promise<Family[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch families');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Get family by ID
export async function getFamily(familyId: string): Promise<Family> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch family');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Create new family (SuperAdmin only)
export async function createFamily(familyName: string): Promise<Family> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ family_name: familyName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create family');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Update family (Family Admin only)
export async function updateFamily(familyId: string, updates: Partial<Family>): Promise<Family> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update family');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Delete family (SuperAdmin only)
export async function deleteFamily(familyId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete family');
    }
  } catch (error) {
    throw error;
  }
}

// Get all family members for a family
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}/members`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch family members');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Get family member by ID
export async function getFamilyMember(familyId: string, memberId: string): Promise<FamilyMember> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}/members/${memberId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch family member');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Create new family member
export async function createFamilyMember(
  familyId: string,
  name: string,
  photoUrl?: string,
  relationships?: Record<string, string>,
  customFields?: Record<string, any>
): Promise<FamilyMember> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        photo_url: photoUrl,
        relationships: relationships || {},
        custom_fields: customFields || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create family member');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Update family member
export async function updateFamilyMember(
  familyId: string,
  memberId: string,
  updates: Partial<FamilyMember>
): Promise<FamilyMember> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}/members/${memberId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update family member');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Delete family member
export async function deleteFamilyMember(familyId: string, memberId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete family member');
    }
  } catch (error) {
    throw error;
  }
}
