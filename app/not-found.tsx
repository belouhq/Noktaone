"use client";

export default function NotFound() {
  const goTo = (path: string) => {
    try {
      (window.top || window).location.href = path;
    } catch {
      window.location.href = path;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>404</h1>
      <p style={{ color: "#9ca3af", margin: 0 }}>Page non trouvée</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          type="button"
          onClick={() => goTo("/home")}
          style={{
            padding: "14px 28px",
            background: "#0A84FF",
            color: "#fff",
            borderRadius: "12px",
            border: "none",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Accueil app
        </button>
        <button
          type="button"
          onClick={() => goTo("/")}
          style={{
            padding: "14px 28px",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.3)",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Page d&apos;accueil
        </button>
        <a
          href="/home"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "14px 28px",
            background: "rgba(34,197,94,0.2)",
            color: "#4ade80",
            borderRadius: "12px",
            border: "1px solid rgba(34,197,94,0.5)",
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Ouvrir dans le navigateur →
        </a>
      </div>
    </div>
  );
}
