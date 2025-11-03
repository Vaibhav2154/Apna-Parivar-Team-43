'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">👨‍👩‍👧‍👦 Apna Parivar</h1>
          <p className="text-xl text-muted-foreground">Keep your family connected</p>
        </div>

        {/* Login Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* SuperAdmin Login */}
          <Link
            href="/superadmin-login"
            className="group p-8 bg-card rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="text-4xl mb-4">👑</div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">SuperAdmin</h2>
            <p className="text-muted-foreground mb-4">
              Manage admin registrations and system oversight
            </p>
            <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold group-hover:opacity-80 transition">
              Login as SuperAdmin →
            </span>
          </Link>

          {/* Family Admin */}
          <div className="space-y-4">
            {/* Admin Login */}
            <Link
              href="/admin-login"
              className="block group p-6 bg-card rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-3xl mb-2">👨‍💼</div>
              <h3 className="text-lg font-bold text-card-foreground mb-1">Family Admin</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Manage your family
              </p>
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-semibold group-hover:opacity-80 transition">
                Login →
              </span>
            </Link>

            {/* Admin Signup */}
            <Link
              href="/admin-signup"
              className="block group p-6 bg-card rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-3xl mb-2">📝</div>
              <h3 className="text-lg font-bold text-card-foreground mb-1">New Family Admin</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Register your family
              </p>
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-semibold group-hover:opacity-80 transition">
                Register →
              </span>
            </Link>
          </div>
        </div>

        {/* Family Member Login */}
        <Link
          href="/member-login"
          className="block group p-8 bg-card rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Family Member</h2>
          <p className="text-muted-foreground mb-4">
            Login with your family credentials to view the family tree
          </p>
          <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold group-hover:opacity-80 transition">
            Login as Family Member →
          </span>
        </Link>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground">
          <p>Need help? <Link href="/" className="text-foreground hover:opacity-70 font-medium">Contact support</Link></p>
        </div>
      </div>
    </div>
  );
}
