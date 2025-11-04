import React, { Suspense } from 'react';
import AdminLoginContent from './admin-login-content';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}

