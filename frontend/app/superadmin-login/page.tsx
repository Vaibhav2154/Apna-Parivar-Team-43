'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import Link from 'next/link';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { superAdminLogin, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await superAdminLogin(username, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card dark:bg-[#000000] rounded-lg shadow-xl dark:shadow-2xl overflow-hidden dark:border dark:border-gray-800">
          {/* Header */}
          <div className="bg-primary px-6 py-8">
            <h1 className="text-3xl font-bold text-primary-foreground">Apna Parivar</h1>
            <p className="text-primary-foreground/80 mt-2">SuperAdmin Login</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Welcome Message */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-card-foreground">System Management</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Manage admin registrations and approvals
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-card-foreground mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-card-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    <span className="dark:inline-block emoji-hide">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">
                  Are you a Family Admin?{' '}
                  <Link href="/admin-login" className="text-foreground font-medium hover:opacity-70">
                    Login here
                  </Link>
                </p>
                <p className="mb-6">
                  Are you a Family Member?{' '}
                  <Link href="/member-login" className="text-foreground font-medium hover:opacity-70">
                    Login here
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link href="/" className="text-foreground hover:opacity-70 font-medium text-sm">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
