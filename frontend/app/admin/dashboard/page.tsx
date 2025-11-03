'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import Link from 'next/link';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  added_at: string;
}

interface FamilyDetails {
  id: string;
  name: string;
  admin_email: string;
  admin_name: string;
  created_at: string;
  member_count: number;
  members?: FamilyMember[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const [familyDetails, setFamilyDetails] = useState<FamilyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    relationship: '',
  });
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'family_admin') {
      router.push('/admin-login');
      return;
    }

    // Fetch family details
    fetchFamilyDetails();
  }, [isAuthenticated, user, router]);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // In a real app, you'd fetch this from your API
      // For now, we'll use mock data based on the auth context
      const mockFamilyDetails: FamilyDetails = {
        id: user?.family_id || 'unknown',
        name: user?.family_id ? 'Your Family' : 'Family',
        admin_email: user?.email || '',
        admin_name: user?.full_name || 'Admin',
        created_at: new Date().toISOString(),
        member_count: 0,
        members: [],
      };

      setFamilyDetails(mockFamilyDetails);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newMember.name.trim()) {
      setError('Please enter member name');
      return;
    }
    if (!newMember.email.trim()) {
      setError('Please enter member email');
      return;
    }
    if (!newMember.relationship.trim()) {
      setError('Please select a relationship');
      return;
    }

    try {
      setAddMemberLoading(true);
      // TODO: Call API to add family member
      // For now, just add locally
      const member: FamilyMember = {
        id: Math.random().toString(36).substr(2, 9),
        name: newMember.name,
        email: newMember.email,
        relationship: newMember.relationship,
        added_at: new Date().toISOString(),
      };

      setFamilyDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: [...(prev.members || []), member],
          member_count: (prev.members?.length || 0) + 1,
        };
      });

      setNewMember({ name: '', email: '', relationship: '' });
      setShowAddMember(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      setFamilyDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members?.filter((m) => m.id !== memberId) || [],
          member_count: (prev.members?.length || 1) - 1,
        };
      });
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'family_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">👨‍👩‍👧‍👦 Family Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your family and members</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Approval Status Banner */}
        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-primary">Account Approved</h3>
              <p className="text-sm text-primary/80">Your admin account is active and ready to use</p>
            </div>
          </div>
        </div>

        {/* Family Info Card */}
        {familyDetails && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Family Name Card */}
            <div className="bg-card rounded-lg shadow p-6 border border-border">
              <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
              <p className="text-muted-foreground text-sm font-medium">Family Name</p>
              <p className="text-2xl font-bold text-card-foreground">{familyDetails.name}</p>
              <p className="text-xs text-muted-foreground mt-2">Created {new Date(familyDetails.created_at).toLocaleDateString()}</p>
            </div>

            {/* Admin Info Card */}
            <div className="bg-card rounded-lg shadow p-6 border border-border">
              <div className="text-4xl mb-2">👤</div>
              <p className="text-muted-foreground text-sm font-medium">Admin Info</p>
              <p className="text-lg font-bold text-card-foreground">{familyDetails.admin_name}</p>
              <p className="text-xs text-muted-foreground mt-2">{familyDetails.admin_email}</p>
            </div>

            {/* Members Card */}
            <div className="bg-card rounded-lg shadow p-6 border border-border">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-muted-foreground text-sm font-medium">Total Members</p>
              <p className="text-2xl font-bold text-card-foreground">{familyDetails.member_count}</p>
              <button
                onClick={() => setShowAddMember(true)}
                className="mt-3 text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 transition"
              >
                + Add Member
              </button>
            </div>
          </div>
        )}

        {/* Members Section */}
        <div className="bg-card rounded-lg shadow border border-border">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-2xl font-bold text-card-foreground">Family Members</h2>
            <button
              onClick={() => setShowAddMember(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              + Add Member
            </button>
          </div>

          {/* Members List */}
          <div className="p-6">
            {familyDetails?.members && familyDetails.members.length > 0 ? (
              <div className="space-y-4">
                {familyDetails.members.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-4 bg-background rounded-lg hover:bg-background/80 transition border border-border">
                    <div>
                      <p className="font-semibold text-card-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Relationship: {member.relationship}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-1 bg-destructive/10 text-destructive rounded hover:opacity-90 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No members added yet</p>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="mt-3 text-primary font-semibold hover:opacity-70"
                >
                  Add your first member
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">Add Family Member</h2>

              <form onSubmit={handleAddMember} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    disabled={addMemberLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="john@family.com"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    disabled={addMemberLoading}
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Relationship
                  </label>
                  <select
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    disabled={addMemberLoading}
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    disabled={addMemberLoading}
                    className="flex-1 px-4 py-2 border border-border text-card-foreground rounded-lg hover:bg-background/50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMemberLoading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {addMemberLoading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
