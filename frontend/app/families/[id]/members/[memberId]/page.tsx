'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { getFamilyMember } from '@/lib/family-service';
import { FamilyMember } from '@/lib/types';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function MemberDetailPage() {
  const params = useParams();
  const familyId = params.id as string;
  const memberId = params.memberId as string;
  const { user } = useAuth();

  const [member, setMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMember();
  }, [familyId, memberId]);

  const loadMember = async () => {
    try {
      setIsLoading(true);
      const data = await getFamilyMember(familyId, memberId);
      setMember(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load member');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === 'family_admin' || user?.role === 'family_co_admin';

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={['family_admin', 'family_co_admin', 'family_user']}>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !member) {
    return (
      <ProtectedRoute requiredRole={['family_admin', 'family_co_admin', 'family_user']}>
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error || 'Member not found'}</p>
            </div>
            <Link href={`/families/${familyId}/members`} className="text-white/60 hover:text-white mt-4 inline-flex items-center gap-2 transition">
              ← Back to Members
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['family_admin', 'family_co_admin', 'family_user']}>
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/families/${familyId}/members`} className="text-white/60 hover:text-white mb-4 inline-flex items-center gap-2 transition">
              ← Back to Members
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">{member.name}</h1>
            <p className="text-muted-foreground mt-3 text-lg">Family member details</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 overflow-hidden">
            {/* Photo */}
            {member.photo_url && (
              <div className="w-full h-80 bg-white/5 relative">
                <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Details */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Information</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="text-lg text-foreground mt-1">{member.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Member ID</dt>
                    <dd className="text-foreground font-mono text-sm mt-1">{member.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Added</dt>
                    <dd className="text-lg text-foreground mt-1">{new Date(member.created_at).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>

              {/* Relationships */}
              {Object.keys(member.relationships).length > 0 && (
                <div className="border-t border-white/10 pt-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Relationships</h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(member.relationships).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
                        <dd className="text-lg text-foreground mt-1">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Custom Fields */}
              {Object.keys(member.custom_fields).length > 0 && (
                <div className="border-t border-white/10 pt-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Additional Information</h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(member.custom_fields).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
                        <dd className="text-lg text-foreground mt-1">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Actions */}
              {isAdmin && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Link
                    href={`/families/${familyId}/members/${memberId}/edit`}
                    className="px-6 py-2.5 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
                  >
                    Edit Member
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
