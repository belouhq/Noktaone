export default function Loading() {
  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center"
      style={{ minHeight: "100dvh" }}
    >
      <div
        className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin"
        aria-hidden
      />
    </div>
  );
}
