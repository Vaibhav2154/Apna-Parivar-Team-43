'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl sm:text-7xl font-bold text-foreground">403</h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Access Denied</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          You don't have permission to access this resource. Your role is not authorized for this action.
        </p>
        <Link
          href="/dashboard"
          className="inline-block py-2.5 px-8 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
