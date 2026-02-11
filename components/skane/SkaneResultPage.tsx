"use client";
// @ts-nocheck

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

// ============================================
// ÉCRAN RÉSULTAT SKANE - V3 OPTIMISÉ UX
// Features: Haptic, Flash, Toggle intégré, Share direct, Lien app
// Compatible PWA + Vercel
// ============================================

interface SkaneResultPageProps {
  scoreBefore?: number;
  scoreAfter?: number;
  microAction?: string;
  duration?: number;
  feedback?: "clear" | "reduced" | "still_high";
  onRetry?: () => void;
  onHome?: () => void;
  appDownloadLink?: string;
}

const SkaneResultPage: React.FC<SkaneResultPageProps> = ({
  scoreBefore = 91,
  scoreAfter = 42,
  microAction = "Expiration longue",
  duration = 30,
  feedback = "clear", // 'clear' | 'reduced' | 'still_high'
  onRetry = () => {},
  onHome = () => {},
  appDownloadLink = "https://nokta.app/download",
}) => {
  // Cooldown logic
  const cooldownConfig = {
    clear: { duration: 15 * 60, showRetryDelay: 10 },
    reduced: { duration: 10 * 60, showRetryDelay: 5 },
    still_high: { duration: 0, showRetryDelay: 0 },
  };

  const [remainingTime, setRemainingTime] = useState(
    cooldownConfig[feedback].duration
  );
  const [showRetry, setShowRetry] = useState(feedback === "still_high");

  // Share Flow States
  const [shareStep, setShareStep] = useState<"idle" | "camera" | "countdown" | "recording" | "preview">("idle");
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedMedia, setCapturedMedia] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [cameraError, setCameraError] = useState<"permission" | "notfound" | "unknown" | null>(null);
  const [includeAppLink, setIncludeAppLink] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ============================================
  // HAPTIC FEEDBACK (PWA compatible)
  // ============================================

  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
    if (typeof navigator === "undefined" || !navigator.vibrate) return;

    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(25);
        break;
      case "heavy":
        navigator.vibrate(50);
        break;
      case "success":
        navigator.vibrate([10, 50, 20]);
        break;
      case "error":
        navigator.vibrate([50, 30, 50]);
        break;
      default:
        navigator.vibrate(10);
    }
  }, []);

  // ============================================
  // FLASH EFFECT
  // ============================================

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    triggerHaptic("medium");
    setTimeout(() => setShowFlash(false), 150);
  }, [triggerHaptic]);

  // ============================================
  // COOLDOWN TIMER
  // ============================================

  useEffect(() => {
    if (remainingTime <= 0) {
      setShowRetry(true);
      return;
    }
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setShowRetry(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);

  useEffect(() => {
    const delay = cooldownConfig[feedback].showRetryDelay * 1000;
    if (delay > 0 && feedback !== "still_high") {
      const timeout = setTimeout(() => setShowRetry(true), delay);
      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Status label
  const getStatusLabel = () => {
    if (scoreAfter <= 30) return "Équilibré";
    if (scoreAfter <= 45) return "Apaisé";
    return "Encore élevé";
  };

  // ============================================
  // CAMERA FUNCTIONS
  // ============================================

  const startCamera = useCallback(
    async (facing: "user" | "environment" = facingMode) => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        setCameraError("unknown");
        return;
      }

      setCameraError(null);

      try {
        const permissionStatus = await (navigator as any).permissions
          ?.query({ name: "camera" as any })
          .catch(() => null);

        if (permissionStatus?.state === "denied") {
          setCameraError("permission");
          return;
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facing,
            width: { ideal: 1080, min: 720 },
            height: { ideal: 1920, min: 1280 },
            aspectRatio: { ideal: 9 / 16 },
          },
          audio: captureMode === "video",
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          (videoRef.current as any).srcObject = stream;
          await videoRef.current.play();
        }

        triggerHaptic("light");
      } catch (err: any) {
        console.error("Erreur caméra:", err);

        if (err?.name === "NotAllowedError") {
          setCameraError("permission");
        } else if (err?.name === "NotFoundError") {
          setCameraError("notfound");
        } else {
          setCameraError("unknown");
        }
      }
    },
    [facingMode, captureMode, triggerHaptic]
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const switchCamera = useCallback(async () => {
    triggerHaptic("light");
    stopCamera();
    const newFacing: "user" | "environment" =
      facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    setTimeout(() => startCamera(newFacing), 150);
  }, [facingMode, stopCamera, startCamera, triggerHaptic]);

  // Toggle photo/video mode
  const toggleCaptureMode = useCallback(
    (mode: "photo" | "video") => {
      if (mode === captureMode) return;
      triggerHaptic("light");
      setCaptureMode(mode);

      stopCamera();
      setTimeout(() => startCamera(facingMode), 150);
    },
    [captureMode, facingMode, stopCamera, startCamera, triggerHaptic]
  );

  // Open camera directly
  const openCamera = useCallback(() => {
    setShareStep("camera");
    setTimeout(() => startCamera(), 100);
  }, [startCamera]);

  // ============================================
  // PHOTO CAPTURE
  // ============================================

  const drawOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const gradient = ctx.createLinearGradient(0, height * 0.65, 0, height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.4, "rgba(0,0,0,0.2)");
      gradient.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height * 0.65, width, height * 0.35);

      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font =
        "600 28px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("SKANE INDEX", 48, 90);

      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font =
        "500 28px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
      ctx.fillText("NOKTA ONE", width - 48, 90);

      const scoreY = height - 320;
      const circleRadius = 56;

      const beforeX = width * 0.3;
      drawScoreCircle(ctx, beforeX, scoreY, circleRadius, scoreBefore, "#FF453A");

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font =
        "400 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("→", width * 0.5, scoreY + 10);

      const afterX = width * 0.7;
      drawScoreCircle(ctx, afterX, scoreY, circleRadius, scoreAfter, "#30D158");

      ctx.font =
        "600 18px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.textAlign = "center";
      (ctx as any).letterSpacing = "0.05em";
      ctx.fillText("AVANT", beforeX, scoreY + circleRadius + 36);
      ctx.fillText("APRÈS", afterX, scoreY + circleRadius + 36);

      ctx.font =
        "500 26px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.textAlign = "center";
      ctx.fillText(`${microAction} · ${duration}s`, width / 2, height - 120);

      ctx.font =
        "400 16px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText("Wellness signal · Not medical", width / 2, height - 60);
    },
    [scoreBefore, scoreAfter, microAction, duration]
  );

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    triggerFlash();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    ctx.save();
    if (facingMode === "user") {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -1080, 0, 1080, 1920);
    } else {
      ctx.drawImage(video, 0, 0, 1080, 1920);
    }
    ctx.restore();

    drawOverlay(ctx, canvas.width, canvas.height);

    const photoData = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedMedia({ type: "photo", data: photoData });

    try {
      sessionStorage.setItem(
        "nokta_temp_capture",
        JSON.stringify({
          type: "photo",
          data: photoData,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn("Could not cache capture:", e);
    }

    stopCamera();
    setShareStep("preview");
    triggerHaptic("success");
  }, [facingMode, stopCamera, triggerFlash, triggerHaptic, drawOverlay]);

  // ============================================
  // VIDEO CAPTURE
  // ============================================

  const startRecording = useCallback(() => {
    if (!streamRef.current || !canvasRef.current || !videoRef.current) return;

    setShareStep("recording");
    setIsRecording(true);
    setRecordingTime(0);
    chunksRef.current = [];
    triggerHaptic("heavy");

    const canvas = canvasRef.current;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isActive = true;

    const drawFrame = () => {
      if (!isActive || !videoRef.current) return;

      ctx.save();
      if (facingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -1080, 0, 1080, 1920);
      } else {
        ctx.drawImage(videoRef.current, 0, 0, 1080, 1920);
      }
      ctx.restore();

      drawOverlay(ctx, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const canvasStream = canvas.captureStream(30);
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];

    let selectedMimeType = "";
    for (const mimeType of mimeTypes) {
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }

    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: selectedMimeType || undefined,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      isActive = false;
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const blob = new Blob(chunksRef.current, {
        type: selectedMimeType || "video/webm",
      });
      const videoUrl = URL.createObjectURL(blob);
      setCapturedMedia({ type: "video", data: videoUrl, blob });

      try {
        sessionStorage.setItem(
          "nokta_temp_capture",
          JSON.stringify({
            type: "video",
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn("Could not cache capture:", e);
      }

      setShareStep("preview");
      triggerHaptic("success");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 15) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [facingMode, triggerHaptic, drawOverlay]);

  const startVideoCountdown = useCallback(() => {
    triggerHaptic("medium");
    setShareStep("countdown");
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        triggerHaptic("light");
        return prev - 1;
      });
    }, 1000);
  }, [triggerHaptic, startRecording]);

  const stopRecording = useCallback(() => {
    if (recordingTime < 3) {
      triggerHaptic("error");
      return;
    }

    setIsRecording(false);
    triggerHaptic("medium");

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    stopCamera();
  }, [recordingTime, stopCamera, triggerHaptic]);

  const drawScoreCircle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    score: number,
    color: string
  ) => {
    const progress = score / 100;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + 2 * Math.PI * progress;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.font =
      "700 40px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(score.toString(), x, y);
  };

  // ============================================
  // SHARE FUNCTIONS
  // ============================================

  const getShareText = useCallback(() => {
    const baseText = `Mon signal est passé de ${scoreBefore} à ${scoreAfter} avec Nokta One 🧘`;
    if (includeAppLink) {
      return `${baseText}\n\nEssaie toi aussi → ${appDownloadLink}`;
    }
    return baseText;
  }, [scoreBefore, scoreAfter, includeAppLink, appDownloadLink]);

  const downloadMedia = useCallback(() => {
    if (!capturedMedia) return;
    triggerHaptic("light");

    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];

    if (capturedMedia.type === "photo") {
      link.href = capturedMedia.data;
      link.download = `nokta-skane-${date}.jpg`;
    } else {
      link.href = capturedMedia.data;
      link.download = `nokta-skane-${date}.webm`;
    }
    link.click();
    triggerHaptic("success");
  }, [capturedMedia, triggerHaptic]);

  const shareToApp = useCallback(
    async (platform: "native" | "whatsapp" | "copy" | "fallback") => {
      if (!capturedMedia) return;
      triggerHaptic("light");

      const shareText = getShareText();

      try {
        let file: File | undefined;
        if (capturedMedia.type === "photo") {
          const response = await fetch(capturedMedia.data);
          const blob = await response.blob();
          file = new File([blob], "nokta-skane.jpg", { type: "image/jpeg" });
        } else {
          file = new File(
            [capturedMedia.blob],
            "nokta-skane.webm",
            {
              type: capturedMedia.blob.type || "video/webm",
            }
          );
        }

        if (
          platform === "native" &&
          (navigator as any).share &&
          (navigator as any).canShare?.({ files: [file] })
        ) {
          await (navigator as any).share({
            files: [file],
            title: "Mon Skane - Nokta One",
            text: shareText,
          });
          triggerHaptic("success");
          return;
        }

        if (platform === "copy") {
          await navigator.clipboard?.writeText(shareText);
          downloadMedia();
          triggerHaptic("success");
          return;
        }

        const encodedText = encodeURIComponent(shareText);

        switch (platform) {
          case "whatsapp":
            window.open(`whatsapp://send?text=${encodedText}`, "_blank");
            downloadMedia();
            break;
          default:
            if ((navigator as any).share) {
              await (navigator as any).share({
                files: [file],
                title: "Mon Skane - Nokta One",
                text: shareText,
              });
            } else {
              downloadMedia();
            }
        }

        triggerHaptic("success");
      } catch (err) {
        console.error("Erreur partage:", err);
        triggerHaptic("error");
        downloadMedia();
      }
    },
    [capturedMedia, getShareText, triggerHaptic, downloadMedia]
  );

  const retakeMedia = useCallback(() => {
    triggerHaptic("light");
    setCapturedMedia(null);
    setShareStep("camera");
    setTimeout(() => startCamera(), 100);
  }, [startCamera, triggerHaptic]);

  const cancelShare = useCallback(() => {
    triggerHaptic("light");
    stopCamera();
    setCapturedMedia(null);
    setShareStep("idle");
    setRecordingTime(0);
    setCountdown(0);
    setCameraError(null);
  }, [stopCamera, triggerHaptic]);

  const openSettings = useCallback(() => {
    alert(
      "Pour activer la caméra, allez dans Réglages > Safari > Caméra et sélectionnez 'Autoriser'"
    );
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      try {
        sessionStorage.removeItem("nokta_temp_capture");
      } catch (e) {}
    };
  }, [stopCamera]);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("nokta_temp_capture");
      if (cached) {
        const data = JSON.parse(cached);
        if (
          Date.now() - data.timestamp < 5 * 60 * 1000 &&
          data.type === "photo" &&
          data.data
        ) {
          setCapturedMedia({ type: "photo", data: data.data });
          setShareStep("preview");
        }
      }
    } catch (e) {}
  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={styles.container}>
      {showFlash && <div style={styles.flashOverlay} />}

      {(shareStep === "camera" ||
        shareStep === "countdown" ||
        shareStep === "recording") && (
        <div style={styles.cameraModal}>
          {cameraError && (
            <div style={styles.errorOverlay}>
              <div style={styles.errorContent}>
                <span style={styles.errorIcon}>📷</span>
                <h3 style={styles.errorTitle}>
                  {cameraError === "permission"
                    ? "Accès caméra refusé"
                    : cameraError === "notfound"
                    ? "Caméra non trouvée"
                    : "Erreur caméra"}
                </h3>
                <p style={styles.errorText}>
                  {cameraError === "permission"
                    ? "Autorisez l'accès à la caméra pour partager votre Skane"
                    : "Impossible d'accéder à la caméra"}
                </p>
                {cameraError === "permission" && (
                  <button style={styles.errorButton} onClick={openSettings}>
                    Ouvrir les réglages
                  </button>
                )}
                <button
                  style={styles.errorButtonSecondary}
                  onClick={cancelShare}
                >
                  Retour
                </button>
              </div>
            </div>
          )}

          <div style={styles.cameraHeader}>
            <button style={styles.modalCloseBtn} onClick={cancelShare}>
              <CloseIcon />
            </button>

            <div style={styles.modeToggle}>
              <button
                style={{
                  ...styles.modeToggleBtn,
                  ...(captureMode === "photo"
                    ? styles.modeToggleBtnActive
                    : {}),
                }}
                onClick={() => toggleCaptureMode("photo")}
              >
                Photo
              </button>
              <button
                style={{
                  ...styles.modeToggleBtn,
                  ...(captureMode === "video"
                    ? styles.modeToggleBtnActive
                    : {}),
                }}
                onClick={() => toggleCaptureMode("video")}
              >
                Vidéo
              </button>
            </div>

            <button style={styles.switchCameraBtn} onClick={switchCamera}>
              <SwitchCameraIcon />
            </button>
          </div>

          <div style={styles.cameraViewport}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={captureMode === "photo"}
              style={{
                ...styles.cameraVideo,
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />

            <div style={styles.liveOverlay}>
              <div style={styles.overlayHeader}>
                <span style={styles.overlayHeaderText}>SKANE INDEX</span>
                <span style={styles.overlayHeaderBrand}>NOKTA ONE</span>
              </div>

              <div style={styles.overlayFooter}>
                <div style={styles.overlayScores}>
                  <div style={styles.overlayScoreItem}>
                    <div
                      style={{
                        ...styles.overlayCircle,
                        borderColor: "#FF453A",
                      }}
                    >
                      <span
                        style={{
                          ...styles.overlayScoreValue,
                          color: "#FF453A",
                        }}
                      >
                        {scoreBefore}
                      </span>
                    </div>
                    <span style={styles.overlayScoreLabel}>AVANT</span>
                  </div>

                  <span style={styles.overlayArrow}>→</span>

                  <div style={styles.overlayScoreItem}>
                    <div
                      style={{
                        ...styles.overlayCircle,
                        borderColor: "#30D158",
                      }}
                    >
                      <span
                        style={{
                          ...styles.overlayScoreValue,
                          color: "#30D158",
                        }}
                      >
                        {scoreAfter}
                      </span>
                    </div>
                    <span style={styles.overlayScoreLabel}>APRÈS</span>
                  </div>
                </div>

                <span style={styles.overlayInfo}>
                  {microAction} · {duration}s
                </span>
                <span style={styles.overlayDisclaimer}>
                  Wellness signal · Not medical
                </span>
              </div>
            </div>

            {shareStep === "countdown" && (
              <div style={styles.countdownOverlay}>
                <span style={styles.countdownNumber}>{countdown}</span>
              </div>
            )}

            {shareStep === "recording" && (
              <div style={styles.recordingIndicator}>
                <div style={styles.recordingDot} />
                <span style={styles.recordingTime}>
                  {recordingTime}s{" "}
                  {recordingTime < 3 ? "(min 3s)" : `/ 15s`}
                </span>
              </div>
            )}
          </div>

          <div style={styles.cameraControls}>
            {captureMode === "photo" ? (
              <button style={styles.captureButton} onClick={capturePhoto}>
                <div style={styles.captureButtonInner} />
              </button>
            ) : shareStep === "recording" ? (
              <button
                style={{
                  ...styles.stopButton,
                  opacity: recordingTime < 3 ? 0.5 : 1,
                }}
                onClick={stopRecording}
              >
                <div style={styles.stopButtonInner} />
              </button>
            ) : (
              <button
                style={styles.captureButton}
                onClick={startVideoCountdown}
              >
                <div style={styles.recordButtonInner} />
              </button>
            )}
          </div>

          <p style={styles.cameraHint}>
            {captureMode === "photo"
              ? "Positionnez-vous dans le cadre"
              : shareStep === "recording"
              ? recordingTime < 3
                ? `Minimum ${3 - recordingTime}s...`
                : "Appuyez pour arrêter"
              : "Timer 3s avant enregistrement"}
          </p>
        </div>
      )}

      {shareStep === "preview" && capturedMedia && (
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <button style={styles.modalCloseBtn} onClick={cancelShare}>
              <CloseIcon />
            </button>
            <span style={styles.modalTitle}>Aperçu</span>
            <button style={styles.retakeBtn} onClick={retakeMedia}>
              Reprendre
            </button>
          </div>

          <div style={styles.previewContent}>
            {capturedMedia.type === "photo" ? (
              <img
                src={capturedMedia.data}
                alt="Preview"
                style={styles.previewMedia}
              />
            ) : (
              <video
                src={capturedMedia.data}
                controls
                autoPlay
                loop
                playsInline
                style={styles.previewMedia}
              />
            )}
          </div>

          <div style={styles.linkOption}>
            <label style={styles.linkOptionLabel}>
              <input
                type="checkbox"
                checked={includeAppLink}
                onChange={(e) => setIncludeAppLink(e.target.checked)}
                style={styles.linkOptionCheckbox}
              />
              <span style={styles.linkOptionText}>Inclure le lien Nokta</span>
            </label>
          </div>

          <div style={styles.shareAppsRow}>
            <button
              style={styles.shareAppBtn}
              onClick={() => shareToApp("native")}
            >
              <ShareIcon size={24} />
              <span>Partager</span>
            </button>
            <button
              style={styles.shareAppBtn}
              onClick={() => shareToApp("whatsapp")}
            >
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </button>
            <button
              style={styles.shareAppBtn}
              onClick={() => shareToApp("copy")}
            >
              <CopyIcon />
              <span>Copier</span>
            </button>
          </div>

          <div style={styles.shareActions}>
            <button style={styles.saveBtn} onClick={downloadMedia}>
              <DownloadIcon />
              <span>Enregistrer dans la galerie</span>
            </button>
          </div>
        </div>
      )}

      {shareStep === "idle" && (
        <>
          <header style={styles.header}>
            <span style={styles.headerTitle}>SKANE INDEX</span>
            <span style={styles.headerBrand}>NOKTA ONE</span>
          </header>

          <main style={styles.content}>
            <div style={styles.scoresContainer}>
              <div style={styles.scoreBlock}>
                <ScoreCircle value={scoreBefore} color="#FF453A" />
                <div style={styles.scoreLabels}>
                  <span style={styles.scoreLabelTitle}>AVANT</span>
                  <span style={styles.scoreLabelStatus}>Élevé</span>
                </div>
              </div>

              <span style={styles.arrow}>→</span>

              <div style={styles.scoreBlock}>
                <ScoreCircle value={scoreAfter} color="#30D158" />
                <div style={styles.scoreLabels}>
                  <span style={styles.scoreLabelTitle}>APRÈS</span>
                  <span
                    style={{
                      ...styles.scoreLabelStatus,
                      color: "#30D158",
                    }}
                  >
                    {getStatusLabel()}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.detailsSection}>
              <span style={styles.detailsSectionTitle}>
                DÉTAILS DU SKANE
              </span>
              <div style={styles.detailsList}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Variation</span>
                  <span style={styles.detailValue}>
                    -{scoreBefore - scoreAfter} points
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Micro-action</span>
                  <span style={styles.detailValue}>{microAction}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Durée</span>
                  <span style={styles.detailValue}>{duration} sec</span>
                </div>
              </div>
              <span style={styles.disclaimer}>
                Wellness signal · Not medical
              </span>
            </div>
          </main>

          <footer style={styles.footer}>
            <button style={styles.shareButton} onClick={openCamera}>
              <CameraIcon size={20} />
              <span>Partager mon Skane</span>
            </button>

            <div style={styles.cooldownSection}>
              {remainingTime > 0 && !showRetry ? (
                <div style={styles.cooldownInfo}>
                  <ClockIcon />
                  <span style={styles.cooldownText}>
                    Prochain Skane dans {formatTime(remainingTime)}
                  </span>
                </div>
              ) : (
                <button style={styles.retryButton} onClick={onRetry}>
                  <RetryIcon />
                  <span>Refaire un Skane</span>
                </button>
              )}
            </div>

            <button style={styles.homeButton} onClick={onHome}>
              <HomeIcon />
              <span>Retour à l'accueil</span>
            </button>
          </footer>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

// ============================================
// COMPOSANT CERCLE SCORE
// ============================================

const ScoreCircle: React.FC<{ value: number; color: string; size?: number }> = ({
  value,
  color,
  size = 100,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = value / 100;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1C1C1E"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span style={{ fontSize: "24px", fontWeight: 600, color }}>
          {value}
        </span>
      </div>
    </div>
  );
};

// ============================================
// ICÔNES
// ============================================

const CloseIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8E8E93"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CameraIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const SwitchCameraIcon: React.FC = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="1.5"
  >
    <path d="M16 3h5v5M8 21H3v-5" />
    <path d="M21 3l-7.5 7.5M3 21l7.5-7.5" />
  </svg>
);

const ShareIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <polyline points="16,6 12,2 8,6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const WhatsAppIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#25D366"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const DownloadIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6E6E73"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const RetryIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8E8E93"
    strokeWidth="1.5"
  >
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </svg>
);

const HomeIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6E6E73"
    strokeWidth="1.5"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

// ============================================
// STYLES
// ============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    maxWidth: "430px",
    margin: "0 auto",
    position: "relative",
  },
  flashOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 9999,
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    paddingTop: "60px",
  },
  headerTitle: {
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.1em",
    color: "#8E8E93",
  },
  headerBrand: {
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.05em",
    color: "#6E6E73",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    gap: "40px",
  },
  scoresContainer: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  scoreBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  scoreLabels: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  scoreLabelTitle: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.08em",
    color: "#6E6E73",
  },
  scoreLabelStatus: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#FFFFFF",
  },
  arrow: {
    fontSize: "20px",
    color: "#48484A",
  },
  detailsSection: {
    width: "100%",
    maxWidth: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  detailsSectionTitle: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.08em",
    color: "#6E6E73",
    textAlign: "center",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #1C1C1E",
  },
  detailLabel: {
    fontSize: "15px",
    color: "#6E6E73",
  },
  detailValue: {
    fontSize: "15px",
    color: "#FFFFFF",
  },
  disclaimer: {
    fontSize: "12px",
    color: "#48484A",
    textAlign: "center",
    marginTop: "8px",
  },
  footer: {
    padding: "20px",
    paddingBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  shareButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  cooldownSection: {
    display: "flex",
    justifyContent: "center",
    padding: "8px 0",
  },
  cooldownInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cooldownText: {
    fontSize: "14px",
    color: "#6E6E73",
  },
  retryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: "none",
    border: "1px solid #2C2C2E",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#8E8E93",
    fontSize: "14px",
  },
  homeButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6E6E73",
    fontSize: "14px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    maxWidth: "430px",
    margin: "0 auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    paddingTop: "60px",
  },
  modalCloseBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  modalTitle: {
    fontSize: "17px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  retakeBtn: {
    fontSize: "15px",
    color: "#0A84FF",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    padding: "8px",
  },
  cameraModal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    maxWidth: "430px",
    margin: "0 auto",
  },
  cameraHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    paddingTop: "60px",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modeToggle: {
    display: "flex",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "4px",
  },
  modeToggleBtn: {
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    background: "none",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  modeToggleBtnActive: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  switchCameraBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  cameraViewport: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  cameraVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  errorContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "40px",
    textAlign: "center",
  },
  errorIcon: {
    fontSize: "48px",
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#FFFFFF",
    margin: 0,
  },
  errorText: {
    fontSize: "15px",
    color: "#8E8E93",
    margin: 0,
    maxWidth: "280px",
  },
  errorButton: {
    padding: "14px 28px",
    backgroundColor: "#0A84FF",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "8px",
  },
  errorButtonSecondary: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#8E8E93",
    border: "none",
    fontSize: "15px",
    cursor: "pointer",
  },
  liveOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  overlayHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "100px 24px 20px",
  },
  overlayHeaderText: {
    fontSize: "16px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: "0.05em",
  },
  overlayHeaderBrand: {
    fontSize: "16px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.5)",
  },
  overlayFooter: {
    background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
    padding: "80px 20px 140px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  overlayScores: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
  overlayScoreItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  overlayCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "4px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayScoreValue: {
    fontSize: "28px",
    fontWeight: 700,
  },
  overlayScoreLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.05em",
  },
  overlayArrow: {
    fontSize: "24px",
    color: "rgba(255,255,255,0.5)",
  },
  overlayInfo: {
    fontSize: "18px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.9)",
  },
  overlayDisclaimer: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  countdownNumber: {
    fontSize: "140px",
    fontWeight: 700,
    color: "#FFFFFF",
    textShadow: "0 4px 20px rgba(0,0,0,0.5)",
  },
  recordingIndicator: {
    position: "absolute",
    top: "110px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 18px",
    backgroundColor: "rgba(255,59,48,0.9)",
    borderRadius: "24px",
    zIndex: 15,
  },
  recordingDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
  },
  recordingTime: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  cameraControls: {
    position: "absolute",
    bottom: "50px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 10,
  },
  captureButton: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "4px solid #FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  captureButtonInner: {
    width: "62px",
    height: "62px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
  },
  recordButtonInner: {
    width: "62px",
    height: "62px",
    borderRadius: "50%",
    backgroundColor: "#FF3B30",
  },
  stopButton: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "4px solid #FF3B30",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    transition: "opacity 0.2s ease",
  },
  stopButtonInner: {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    backgroundColor: "#FF3B30",
  },
  cameraHint: {
    position: "absolute",
    bottom: "145px",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: "15px",
    color: "rgba(255,255,255,0.6)",
    zIndex: 10,
  },
  previewContent: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  previewMedia: {
    maxWidth: "100%",
    maxHeight: "100%",
    borderRadius: "16px",
    objectFit: "contain",
  },
  linkOption: {
    padding: "0 20px 16px",
  },
  linkOptionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  linkOptionCheckbox: {
    width: "22px",
    height: "22px",
    accentColor: "#30D158",
  },
  linkOptionText: {
    fontSize: "15px",
    color: "#8E8E93",
  },
  shareAppsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    padding: "0 20px 20px",
  },
  shareAppBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px 20px",
    backgroundColor: "#1C1C1E",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    color: "#FFFFFF",
    minWidth: "90px",
  },
  shareActions: {
    padding: "0 20px 40px",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
  },
};

export default SkaneResultPage;

