/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0a0a0a', soft: '#0d0d12', card: '#101018' },
        neon: {
          cyan: '#00d4ff',
          purple: '#a855f7',
          green: '#10b981',
          orange: '#f59e0b',
          teal: '#14b8a6',
          red: '#ef4444',
        },
        muted: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 212, 255, 0.35)',
        'glow-purple': '0 0 24px rgba(168, 85, 247, 0.35)',
        'glow-green': '0 0 24px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [],
  safelist: [
    { pattern: /(text|bg|border|from|to|via)-(neon-cyan|neon-purple|neon-green|neon-orange|neon-teal|neon-red)/, variants: ['hover'] },
    { pattern: /shadow-(glow|glow-purple|glow-green)/ },
  ],
};
