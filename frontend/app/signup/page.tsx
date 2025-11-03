'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validation
      if (!fullName.trim()) {
        throw new Error('Please enter your full name');
      }

      if (!email.trim()) {
        throw new Error('Please enter your email');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call signup API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create account');
      }

      // Store email for verification
      sessionStorage.setItem('login_email', email);
      setSuccess(true);
      setEmail('');
      setFullName('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Apna Parivar</h1>
          <p className="text-muted-foreground text-lg">Keep your family connected</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 py-8 px-6 rounded-xl sm:px-10 shadow-xl shadow-white/5">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium text-lg mb-2">✓ Account Created!</p>
                <p className="text-green-300/80 text-sm">
                  Welcome, <strong>{fullName}</strong>!
                </p>
                <p className="text-green-300/80 text-sm mt-3">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Create Account</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Input */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-white hover:underline font-medium transition-colors"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Create an account to get started with Apna Parivar</p>
        </div>
      </div>
    </div>
  );
}
