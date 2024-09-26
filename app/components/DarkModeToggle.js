// components/DarkModeToggle.js
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

export default function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {darkMode ? <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" /> : <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />}
    </button>
  );
}
