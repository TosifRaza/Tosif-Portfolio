import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

/** Moon/sun theme toggle — matches the reference mockup's navbar icon. */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
