import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensures theme is loaded on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button className="h-8 w-8 relative" onClick={toggleTheme}>
      {/* Show Sun icon for light mode */}
      <Sun
        className={`h-4 w-4 transition-all ${
          theme === "dark" ? "hidden" : "block"
        }`}
      />
      {/* Show Moon icon for dark mode */}
      <Moon
        className={`h-4 w-4 transition-all ${
          theme === "dark" ? "block" : "hidden"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
