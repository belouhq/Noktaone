import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "nokta-one": {
          black: "#000000",
          white: "#FFFFFF",
          blue: "#3B82F6",
        },
        nokta: {
          blue: '#3B82F6',
          dark: '#0a0a0a',
          card: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      spacing: {
        'safe-top': 'var(--safe-area-top)',
        'safe-bottom': 'var(--safe-area-bottom)',
        'safe-left': 'var(--safe-area-left)',
        'safe-right': 'var(--safe-area-right)',
      },
      minHeight: {
        'screen-safe': 'calc(100dvh - var(--safe-area-top) - var(--safe-area-bottom))',
      },
      padding: {
        'safe': 'var(--safe-area-top) var(--safe-area-right) var(--safe-area-bottom) var(--safe-area-left)',
      },
      screens: {
        'xs': '375px',
        'sm': '428px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
