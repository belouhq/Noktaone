/**
 * Legacy route /skane/flowV1 — redirects to main Skane flow.
 * flowV1/scan did not exist (404). Always use /skane/analyzing.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FlowV1EntryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/skane');
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
