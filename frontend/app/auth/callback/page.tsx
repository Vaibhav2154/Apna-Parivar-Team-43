'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase sends the tokens in hash fragments
        let accessToken = '';
        let refreshToken = '';
        let type = '';

        if (typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1));
            accessToken = hashParams.get('access_token') || '';
            refreshToken = hashParams.get('refresh_token') || '';
            type = hashParams.get('type') || '';

            console.log('Callback params extracted:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
              type
            });
          }
        }

        if (!accessToken) {
          throw new Error('No access token found in URL. Please try requesting a new magic link.');
        }

        // Get email from sessionStorage (was stored during login)
        const email = sessionStorage.getItem('login_email');
        if (!email) {
          throw new Error('Email not found. Please try logging in again.');
        }

        // Fetch user profile from backend using the access token
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // First, try to get existing user profile
        let response = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        let user;

        // If user doesn't exist (404), create one
        if (response.status === 404) {
          console.log('User not found in database, creating new user...');
          
          // Create user record
          const createResponse = await fetch(`${API_BASE_URL}/api/users/create`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              role: 'family_user',
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.detail || 'Failed to create user profile');
          }

          user = await createResponse.json();
        } else if (response.ok) {
          user = await response.json();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch user profile');
        }

        // Save tokens and user to localStorage
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));

        // Clear stored email and hash from URL
        sessionStorage.removeItem('login_email');
        window.history.replaceState({}, document.title, '/auth/callback');

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
        setIsLoading(false);
      }
    };

    // Use a timeout to ensure DOM is ready and hash is available
    const timer = setTimeout(handleCallback, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 text-center px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
            </div>
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        ) : (
          <>
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
              <h2 className="text-lg font-semibold text-red-400 mb-2">Verification Failed</h2>
              <p className="text-red-300/80">{error}</p>
            </div>
            <a
              href="/login"
              className="inline-block py-2.5 px-8 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
            >
              Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
