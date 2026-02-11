"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useHistory, formatAverageImprovement } from "@/lib/history";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import { BottomNav } from "@/components/ui/BottomNav";

const NOKTA_BLUE = "#0A84FF";

// ============================================
// LOADING SKELETON
// ============================================

const SkeletonCard = () => (
  <div style={skeletonStyles.skeletonCard}>
    <div style={skeletonStyles.skeletonCircle} />
    <div style={skeletonStyles.skeletonLines}>
      <div style={{ ...skeletonStyles.skeletonLine, width: "60%" }} />
      <div style={{ ...skeletonStyles.skeletonLine, width: "40%" }} />
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <>
    <div style={skeletonStyles.statsGrid}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={skeletonStyles.skeletonStat} />
      ))}
    </div>
    <div style={skeletonStyles.historySection}>
      <div style={{ ...skeletonStyles.skeletonLine, width: "30%", marginBottom: "16px" }} />
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </>
);

const skeletonStyles: { [key: string]: React.CSSProperties } = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "8px",
  },
  skeletonStat: {
    height: "80px",
    backgroundColor: "#1C1C1E",
    borderRadius: "16px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  historySection: { display: "flex", flexDirection: "column", gap: "16px" },
  skeletonCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    backgroundColor: "#1C1C1E",
    borderRadius: "12px",
  },
  skeletonCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#2C2C2E",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  skeletonLines: { flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  skeletonLine: {
    height: "12px",
    backgroundColor: "#2C2C2E",
    borderRadius: "6px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
};

// ============================================
// STYLES
// ============================================

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
    maxWidth: "430px",
    margin: "0 auto",
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    paddingTop: "env(safe-area-inset-top, 16px)",
  },
  pageTitle: { fontSize: "28px", fontWeight: "700", color: "#FFFFFF" },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 20px",
    paddingBottom: "100px",
    gap: "24px",
    overflowY: "auto",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "8px",
  },
  statCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: "16px",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    position: "relative",
  },
  statCardValue: { fontSize: "24px", fontWeight: "700", color: "#FFFFFF" },
  statCardLabel: { fontSize: "11px", color: "#6E6E73", textAlign: "center" },
  statCardIcon: { position: "absolute", top: "8px", right: "8px", fontSize: "12px", opacity: 0.6 },
  historySection: { display: "flex", flexDirection: "column", gap: "16px" },
  dateGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  dateHeader: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6E6E73",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "4px",
  },
  skanesList: { display: "flex", flexDirection: "column", gap: "8px" },
  skaneCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    backgroundColor: "#1C1C1E",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: "100%",
  },
  skaneCardLeft: { display: "flex", alignItems: "center", gap: "12px" },
  skaneEmoji: { fontSize: "28px" },
  skaneInfo: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" },
  skaneState: { fontSize: "16px", fontWeight: "500", color: "#FFFFFF" },
  skaneTime: { fontSize: "13px", color: "#6E6E73" },
  skaneCardRight: { display: "flex", alignItems: "center", gap: "8px" },
  skaneDelta: { fontSize: "15px", fontWeight: "600" },
  skaneArrow: { fontSize: "20px", color: "#6E6E73" },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "12px",
  },
  emptyEmoji: { fontSize: "48px", opacity: 0.5 },
  emptyText: { fontSize: "18px", fontWeight: "600", color: "#FFFFFF" },
  emptySubtext: { fontSize: "14px", color: "#6E6E73", textAlign: "center" },
  errorState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "12px",
  },
  errorEmoji: { fontSize: "48px" },
  errorText: { fontSize: "16px", color: "#FF3B30", textAlign: "center" },
  loadMoreButton: {
    padding: "14px 24px",
    backgroundColor: "#1C1C1E",
    border: "none",
    borderRadius: "12px",
    color: NOKTA_BLUE,
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    marginTop: "8px",
  },
};

// ============================================
// PAGE
// ============================================

export default function HistoryPage() {
  const router = useRouter();
  const { groups, stats, isLoading, error, hasMore, loadMore } = useHistory();

  const handleNavigate = (key: string) => {
    if (key === "home") router.push("/home");
    else if (key === "skane") router.push("/skane");
    else if (key === "settings") router.push("/settings");
    else if (key === "history") return;
    else router.push("/");
  };

  const handleSkaneDetail = (id: string) => {
    router.push(`/skane/result?id=${id}`);
  };

  return (
    <SafeAreaContainer currentPage="home">
      <div style={styles.container}>
        <header style={styles.header}>
          <span style={styles.pageTitle}>Historique</span>
          <div style={{ width: 40 }} />
        </header>

        <main style={styles.content}>
          {isLoading && groups.length === 0 && <LoadingSkeleton />}

          {error && (
            <div style={styles.errorState}>
              <span style={styles.errorEmoji}>⚠️</span>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <section style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <span style={styles.statCardValue}>{stats.streakCurrent}</span>
                  <span style={styles.statCardLabel}>jours d&apos;affilée</span>
                  <span style={styles.statCardIcon}>🔥</span>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statCardValue}>{stats.totalSkanes}</span>
                  <span style={styles.statCardLabel}>Skanes total</span>
                  <span style={styles.statCardIcon}>📊</span>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statCardValue}>
                    {formatAverageImprovement(stats.averageImprovement)}
                  </span>
                  <span style={styles.statCardLabel}>amélioration moy.</span>
                  <span style={styles.statCardIcon}>📈</span>
                </div>
              </section>

              <section style={styles.historySection}>
                {groups.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyEmoji}>🔍</span>
                    <span style={styles.emptyText}>Aucun Skane pour le moment</span>
                    <span style={styles.emptySubtext}>
                      Faites votre premier Skane depuis l&apos;accueil
                    </span>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group.dateKey} style={styles.dateGroup}>
                      <h3 style={styles.dateHeader}>{group.dateLabel}</h3>
                      <div style={styles.skanesList}>
                        {group.skanes.map((skane) => (
                          <button
                            key={skane.id}
                            style={styles.skaneCard}
                            onClick={() => handleSkaneDetail(skane.id)}
                            aria-label={`Skane du ${group.dateLabel} à ${skane.timeFormatted}`}
                          >
                            <div style={styles.skaneCardLeft}>
                              <span style={styles.skaneEmoji}>{skane.emoji}</span>
                              <div style={styles.skaneInfo}>
                                <span style={styles.skaneState}>{skane.stateLabel}</span>
                                <span style={styles.skaneTime}>{skane.timeFormatted}</span>
                              </div>
                            </div>
                            <div style={styles.skaneCardRight}>
                              <span
                                style={{
                                  ...styles.skaneDelta,
                                  color: skane.delta >= 0 ? "#34C759" : "#FF3B30",
                                }}
                              >
                                {skane.deltaFormatted}
                              </span>
                              <span style={styles.skaneArrow}>›</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                {hasMore && (
                  <button
                    style={styles.loadMoreButton}
                    onClick={loadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? "Chargement..." : "Voir plus"}
                  </button>
                )}
              </section>
            </>
          )}
        </main>

        <BottomNav currentPage="history" onNavigate={handleNavigate} />
      </div>
    </SafeAreaContainer>
  );
}
