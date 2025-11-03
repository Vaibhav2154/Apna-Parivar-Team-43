'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import { AdminOnboardingResponse } from '@/lib/types';
import Link from 'next/link';

export default function AdminStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { checkAdminStatus } = useAuth();
  const requestId = params.id as string;

  const [status, setStatus] = useState<AdminOnboardingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!requestId) {
      router.push('/admin-signup');
      return;
    }

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await checkAdminStatus(requestId);
        setStatus(response);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Auto-refresh if pending
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStatus, 5000); // Check every 5 seconds
    }

    return () => clearInterval(interval);
  }, [requestId, autoRefresh, router]);

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading status...</p>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-lg shadow p-6 max-w-md w-full border border-border">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-card-foreground mb-2">Request Not Found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              href="/admin-signup"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              Back to Signup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = {
    pending: 'accent',
    approved: 'primary',
    rejected: 'destructive',
  };

  const bgColor = statusColor[status?.status as keyof typeof statusColor] || 'secondary';

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Card */}
        <div className={`bg-card rounded-lg shadow-lg overflow-hidden mb-6 border border-border`}>
          {/* Header based on status */}
          <div
            className={`px-6 py-8 text-primary-foreground ${
              bgColor === 'accent'
                ? 'bg-accent'
                : bgColor === 'primary'
                ? 'bg-primary'
                : 'bg-destructive'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">
                {status?.status === 'pending' ? '⏳' : status?.status === 'approved' ? '✅' : '❌'}
              </span>
              <h1 className="text-3xl font-bold">
                {status?.status === 'pending'
                  ? 'Pending Approval'
                  : status?.status === 'approved'
                  ? 'Approved!'
                  : 'Request Rejected'}
              </h1>
            </div>
            <p className="text-sm opacity-90">
              {status?.status === 'pending'
                ? 'Your admin request is being reviewed by SuperAdmin'
                : status?.status === 'approved'
                ? 'Your account has been successfully approved'
                : 'Your admin request was not approved'}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Details */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Email</p>
                  <p className="text-lg text-card-foreground">{status?.email}</p>
                </div>
              </div>

              <div className="flex justify-between items-start pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Family Name</p>
                  <p className="text-lg text-card-foreground">{status?.family_name}</p>
                </div>
              </div>

              <div className="flex justify-between items-start pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Request ID</p>
                  <p className="text-sm font-mono text-card-foreground break-all">{status?.request_id}</p>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Requested on</p>
                  <p className="text-lg text-card-foreground">
                    {new Date(status?.requested_at || '').toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Status-specific messages and actions */}
            {status?.status === 'pending' && (
              <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <h3 className="font-semibold text-accent mb-2">What happens next?</h3>
                <ul className="text-sm text-accent/80 space-y-2 list-disc list-inside">
                  <li>A SuperAdmin will review your application</li>
                  <li>You'll receive an email once approved</li>
                  <li>The review usually takes 24-48 hours</li>
                  <li>This page will update automatically when approved</li>
                </ul>
              </div>
            )}

            {status?.status === 'approved' && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">🎉 Welcome!</h3>
                <p className="text-sm text-primary/80 mb-4">
                  Your admin account has been approved. You can now login and start managing your family.
                </p>
                <Link
                  href="/admin-login"
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {status?.status === 'rejected' && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <h3 className="font-semibold text-destructive mb-2">Request Rejected</h3>
                <p className="text-sm text-destructive/80 mb-3">
                  <strong>Reason:</strong> {status?.rejection_reason || 'No reason provided'}
                </p>
                <p className="text-sm text-destructive/70 mb-4">
                  If you believe this is in error, please contact support or try registering again with different information.
                </p>
                <Link
                  href="/admin-signup"
                  className="inline-block px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition font-medium"
                >
                  Try Again
                </Link>
              </div>
            )}

            {/* Auto-refresh toggle (only for pending) */}
            {status?.status === 'pending' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="autoRefresh" className="text-sm text-muted-foreground">
                  Auto-refresh every 5 seconds
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Back Links */}
        <div className="text-center space-y-2">
          <Link href="/" className="block text-primary hover:opacity-70 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
