'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { getFamilyMembers, deleteFamilyMember } from '@/lib/family-service';
import { FamilyMember } from '@/lib/types';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FamilyMembersPage() {
  const params = useParams();
  const familyId = params.id as string;
  const { user } = useAuth();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMembers();
  }, [familyId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await getFamilyMembers(familyId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to delete ${memberName}?`)) {
      return;
    }

    try {
      await deleteFamilyMember(familyId, memberId);
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  const isAdmin = user?.role === 'family_admin' || user?.role === 'family_co_admin';

  return (
    <ProtectedRoute requiredRole={['family_admin', 'family_co_admin', 'family_user']}>
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 flex justify-between items-start flex-col sm:flex-row gap-6">
            <div>
              <Link href={`/families/${familyId}`} className="text-white/60 hover:text-white mb-4 inline-flex items-center gap-2 transition">
                ← Back to Family
              </Link>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Family Members</h1>
              <p className="text-muted-foreground mt-3 text-lg">Manage all members in your family</p>
            </div>
            {isAdmin && (
              <Link
                href={`/families/${familyId}/members/new`}
                className="px-6 py-2.5 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
              >
                + Add Member
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <p className="text-muted-foreground text-lg">No family members yet. {isAdmin && 'Add your first member!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <div key={member.id} className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105">
                  {member.photo_url && (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-white transition-colors">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Added: {new Date(member.created_at).toLocaleDateString()}
                    </p>

                    <div className="mt-6 flex gap-2 flex-col sm:flex-row">
                      <Link
                        href={`/families/${familyId}/members/${member.id}`}
                        className="flex-1 px-3 py-2 bg-white text-[#010104] text-center font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 text-sm"
                      >
                        View
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            href={`/families/${familyId}/members/${member.id}/edit`}
                            className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500/40 text-green-400 text-center font-medium rounded-lg hover:bg-green-500/30 transition-all duration-300 text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
