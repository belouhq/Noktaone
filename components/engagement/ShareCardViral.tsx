"use client";

import React from "react";
import type { ShareCardProps } from "@/lib/viral/types";

function ArrowRightIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

function NoktaLogoSmall() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      opacity={0.6}
    >
      <path d="M3 8V5a2 2 0 012-2h3" />
      <path d="M16 3h3a2 2 0 012 2v3" />
      <path d="M3 16v3a2 2 0 002 2h3" />
      <path d="M16 21h3a2 2 0 002-2v-3" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "375px",
    aspectRatio: "9/16",
    backgroundColor: "#000000",
    borderRadius: "20px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  },
  photoBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)",
  },
  header: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "auto",
  },
  headerLeft: {
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#FFFFFF",
    opacity: 0.8,
  },
  headerRight: {
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#FFFFFF",
    opacity: 0.8,
  },
  scoresContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    margin: "auto 0",
  },
  scoreCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  scoreCircle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "3px solid",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scoreValue: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#FFFFFF",
  },
  scoreLabel: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#8E8E93",
  },
  scoreState: {
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  arrow: {
    color: "#FFFFFF",
    opacity: 0.6,
  },
  deltaContainer: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "24px 0",
  },
  deltaValue: {
    fontSize: "48px",
    fontWeight: 800,
    color: "#30D158",
  },
  deltaLabel: {
    fontSize: "14px",
    color: "#8E8E93",
  },
  footer: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "auto",
  },
  footerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  footerCheck: {
    color: "#30D158",
    fontSize: "16px",
  },
  footerText: {
    fontSize: "14px",
    color: "#FFFFFF",
  },
  footerDisclaimer: {
    fontSize: "11px",
    color: "#6E6E73",
  },
  watermark: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    opacity: 0.5,
  },
  watermarkText: {
    fontSize: "11px",
    color: "#FFFFFF",
    fontWeight: 500,
  },
};

export function ShareCardViral({
  beforeScore = { min: 80, max: 95 },
  afterScore = { min: 20, max: 35 },
  microAction = "Physiological Sigh",
  duration = 30,
  userPhoto = null,
}: ShareCardProps) {
  const beforeDisplay = `${beforeScore.min}-${beforeScore.max}`;
  const afterDisplay = `${afterScore.min}-${afterScore.max}`;
  const beforeMid = (beforeScore.min + beforeScore.max) / 2;
  const afterMid = (afterScore.min + afterScore.max) / 2;
  const delta = Math.round(beforeMid - afterMid);

  return (
    <div style={styles.container}>
      {userPhoto && (
        <div style={styles.photoBackground}>
          <img src={userPhoto} alt="" style={styles.photo} />
          <div style={styles.photoOverlay} />
        </div>
      )}

      <div style={styles.header}>
        <span style={styles.headerLeft}>SKANE INDEX</span>
        <span style={styles.headerRight}>NOKTA ONE</span>
      </div>

      <div style={styles.scoresContainer}>
        <div style={styles.scoreCard}>
          <div
            style={{
              ...styles.scoreCircle,
              borderColor: "#FF453A",
              width: `${80 + (beforeMid / 100) * 40}px`,
              height: `${80 + (beforeMid / 100) * 40}px`,
            }}
          >
            <span style={styles.scoreValue}>{beforeDisplay}</span>
          </div>
          <span style={styles.scoreLabel}>BEFORE</span>
          <span style={{ ...styles.scoreState, color: "#FF453A" }}>
            HIGH ACTIVATION
          </span>
        </div>

        <div style={styles.arrow}>
          <ArrowRightIcon />
        </div>

        <div style={styles.scoreCard}>
          <div
            style={{
              ...styles.scoreCircle,
              borderColor: "#30D158",
              width: `${80 + (afterMid / 100) * 40}px`,
              height: `${80 + (afterMid / 100) * 40}px`,
            }}
          >
            <span style={styles.scoreValue}>{afterDisplay}</span>
          </div>
          <span style={styles.scoreLabel}>AFTER</span>
          <span style={{ ...styles.scoreState, color: "#30D158" }}>
            CLEAR SIGNAL
          </span>
        </div>
      </div>

      <div style={styles.deltaContainer}>
        <span style={styles.deltaValue}>-{delta}</span>
        <span style={styles.deltaLabel}>en {duration}s</span>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerInfo}>
          <span style={styles.footerCheck}>✓</span>
          <span style={styles.footerText}>
            {microAction} ({duration}s)
          </span>
        </div>
        <span style={styles.footerDisclaimer}>
          Wellness signal · Not medical
        </span>
      </div>

      <div style={styles.watermark}>
        <NoktaLogoSmall />
        <span style={styles.watermarkText}>nokta.app</span>
      </div>
    </div>
  );
}
