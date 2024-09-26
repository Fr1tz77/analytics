// components/FileUploader.js
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

export default function FileUploader({ fileInputRef, handleFileUpload }) {
  return (
    <>
      <button
        onClick={() => fileInputRef.current.click()}
        className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        aria-label="Import data"
      >
        <ArrowUpTrayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />
    </>
  );
}
