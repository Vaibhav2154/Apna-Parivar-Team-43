'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { getAllFamilies } from '@/lib/family-service';
import { Family } from '@/lib/types';
import Link from 'next/link';

export default function FamiliesPage() {
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setIsLoading(true);
      const data = await getAllFamilies();
      setFamilies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load families');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ProtectedRoute requiredRole={['family_admin', 'family_user']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground">Families</h1>
              <p className="text-lg text-muted-foreground">Browse and manage your families</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-5 bg-destructive/10 border border-destructive/30 rounded-2xl">
              <p className="text-destructive font-medium text-lg">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-muted-foreground">Loading families...</p>
              </div>
            </div>
          ) : families.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-border rounded-2xl">
              <p className="text-muted-foreground text-lg">No families yet</p>
              <p className="text-muted-foreground text-sm mt-2">Create your first family to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => (
                <div key={family.id} className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{family.family_name}</h3>
                      <p className="text-xs text-muted-foreground mt-2">ID: {family.id}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(family.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/families/${family.id}`}
                      className="inline-block w-full px-4 py-3 bg-white text-[#010104] text-center font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
                    >
                      View Family
                    </Link>
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
