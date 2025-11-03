'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAllFamilies } from '@/lib/family-service';

export default function CoAdminsPage() {
  const params = useParams();
  const familyId = params.id as string;
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [coAdmins, setCoAdmins] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, you would fetch co-admins from the backend
    // For now, we'll just show the functionality
  }, [familyId]);

  const handleInviteCoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Call backend to invite co-admin
      const response = await fetch('/api/users/invite-co-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          email,
          family_id: familyId,
          role: 'family_co_admin',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to invite co-admin');
      }

      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite co-admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={['family_admin']}>
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Link href={`/families/${familyId}`} className="text-white/60 hover:text-white mb-4 inline-flex items-center gap-2 transition">
              ← Back to Family
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Manage Co-Administrators</h1>
            <p className="text-muted-foreground mt-3 text-lg">Invite and manage co-administrators for your family</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400">✓ {success}</p>
            </div>
          )}

          {/* Invite Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 p-6 sm:p-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Invite Co-Admin</h2>
            <form onSubmit={handleInviteCoAdmin} className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </form>
          </div>

          {/* Co-Admins List */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Current Co-Administrators</h2>
            {coAdmins.length === 0 ? (
              <p className="text-muted-foreground text-lg">No co-administrators assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {coAdmins.map((admin) => (
                  <div key={admin.id} className="flex justify-between items-center p-4 bg-white/10 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
                    <div>
                      <p className="font-medium text-foreground">{admin.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Invited: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 font-medium text-sm"
                      onClick={() => {
                        if (confirm(`Remove ${admin.email} as co-admin?`)) {
                          setCoAdmins(coAdmins.filter((a) => a.id !== admin.id));
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
