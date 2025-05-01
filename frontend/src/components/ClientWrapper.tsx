'use client';

import dynamic from 'next/dynamic';

// Import dynamique avec désactivation du SSR
const Chatbot = dynamic(() => import('@/components/Chatbot'), {
  ssr: false,
});

export default function ClientWrapper() {
  return <Chatbot />;
}
