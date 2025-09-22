"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve query string and redirect to canonical /auth/login
    const qs = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`/auth/login${qs}`);
  }, [router, searchParams]);

  return null;
}
