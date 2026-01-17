"use client";

export default function FaceGuide() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 15 }}>
      {/* Ovale vert pour guider le positionnement du visage */}
      <div
        className="relative"
        style={{
          width: "280px",
          height: "360px",
        }}
      >
        {/* Ovale principal */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "3px solid #10B981",
            borderRadius: "50%",
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
          }}
        />

        {/* Traits de guidage horizontaux */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "20%",
            height: "2px",
            background: "linear-gradient(to right, transparent 0%, #10B981 20%, #10B981 80%, transparent 100%)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            top: "50%",
            height: "2px",
            background: "linear-gradient(to right, transparent 0%, #10B981 20%, #10B981 80%, transparent 100%)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            top: "80%",
            height: "2px",
            background: "linear-gradient(to right, transparent 0%, #10B981 20%, #10B981 80%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        {/* Traits de guidage verticaux */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: "20%",
            width: "2px",
            background: "linear-gradient(to bottom, transparent 0%, #10B981 20%, #10B981 80%, transparent 100%)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: "50%",
            width: "2px",
            background: "linear-gradient(to bottom, transparent 0%, #10B981 20%, #10B981 80%, transparent 100%)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: "80%",
            width: "2px",
            background: "linear-gradient(to bottom, transparent 0%, #10B981 20%, #10B981 80%, transparent 100%)",
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}
