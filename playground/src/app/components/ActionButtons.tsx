import Link from 'next/link';

export default function ActionButtons() {
  return (
    <div className="flex justify-center gap-6 mb-16">
      <Link
        href="/docs"
        className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center w-48"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center">
          <span className="text-2xl mr-3">📚</span>
          <span className="text-xl">Docs</span>
        </div>
      </Link>

      <a
        href="https://github.com/m2na7/react-compact-toast"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden bg-gradient-to-r from-slate-600 to-slate-500 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center w-48"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center space-x-2">
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="flex-shrink-0"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-xl">GitHub</span>
        </div>
      </a>
    </div>
  );
}