/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Legacy aliases (kept so existing classes keep working) → brand blue
        bg: {
          DEFAULT: 'hsl(var(--background))',
          soft: 'hsl(var(--muted))',
          card: 'hsl(var(--card))',
        },
        neon: {
          cyan: {
            300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB',
            DEFAULT: '#3B82F6',
          },
          purple: {
            300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB',
            DEFAULT: '#3B82F6',
          },
          green: { 400: '#34D399', 500: '#10B981', DEFAULT: '#10B981' },
          orange: { 400: '#FBBF24', 500: '#F59E0B', DEFAULT: '#F59E0B' },
          teal: { 400: '#2DD4BF', 500: '#14B8A6', DEFAULT: '#14B8A6' },
          red: { 400: '#F87171', 500: '#EF4444', DEFAULT: '#EF4444' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(59, 130, 246, 0.35)',
        'glow-purple': '0 0 24px rgba(59, 130, 246, 0.35)',
        'glow-green': '0 0 24px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [],
};
