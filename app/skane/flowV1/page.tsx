/**
 * Point d'entrée FlowV1
 * Route conditionnelle : /skane/flowV1
 * Redirige vers le flow approprié selon FLOW_V1_ENABLED
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FLOW_V1_ENABLED } from '@/lib/flowV1';

export default function FlowV1EntryPage() {
  const router = useRouter();

  useEffect(() => {
    if (FLOW_V1_ENABLED) {
      // Redirige vers le nouveau flow
      router.replace('/skane/flowV1/scan');
    } else {
      // Redirige vers le flow existant
      router.replace('/skane');
    }
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
