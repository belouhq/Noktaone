"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import { ResponsiveText } from "@/components/ui/ResponsiveText";
import { BottomNav } from "@/components/ui/BottomNav";
import { getRecentSessions, formatSessionDate, type SkaneSession } from "@/lib/skane/session-model";

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<SkaneSession[]>([]);

  useEffect(() => {
    const recent = getRecentSessions(3);
    setSessions(recent);
  }, []);

  return (
    <SafeAreaContainer currentPage="home">
      <main className="relative min-h-screen-safe bg-nokta-one-black" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <header className="w-full flex justify-center pt-12 pb-6">
          <ResponsiveText as="h1" size="xl" className="font-light text-nokta-one-white tracking-[0.3em]">
            {t("home.title")}
          </ResponsiveText>
        </header>

        {/* History Section */}
        <section className="px-6 pt-8">
          <ResponsiveText as="h2" size="base" className="font-medium text-nokta-one-white mb-4">
            Recent Skane
          </ResponsiveText>
          
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent skanes</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center gap-2">
                  <span className="text-lg">
                    {session.emoji || '😐'}
                  </span>
                  <ResponsiveText size="sm" className="text-nokta-one-white">
                    {formatSessionDate(session.createdAt)}
                  </ResponsiveText>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Back to Home */}
        <div className="px-6 mt-8">
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 rounded-xl text-nokta-one-white font-medium"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            Back to Home
          </button>
        </div>

        {/* Bottom Navigation */}
        <BottomNav currentPage="home" />
      </main>
    </SafeAreaContainer>
  );
}
