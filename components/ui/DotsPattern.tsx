"use client";

export default function DotsPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.1 }}>
      <svg
        className="absolute bottom-0 left-0 w-full h-1/3"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="15" cy="15" r="1" fill="#808080" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}
