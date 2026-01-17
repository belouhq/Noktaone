"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // Caméra frontale
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
        setError("Camera access required");
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (hasPermission === null) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-nokta-one-black"
        style={{ zIndex: 0 }}
      >
        <p className="text-nokta-one-white">Loading camera...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-nokta-one-black"
        style={{ zIndex: 0 }}
      >
        <p className="text-nokta-one-white text-center px-8">
          {error || "Camera access required"}
        </p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
