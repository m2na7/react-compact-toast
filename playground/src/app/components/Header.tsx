import Image from 'next/image';

export default function Header() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mb-4 shadow-lg overflow-hidden">
        <Image
          src="/logo.webp"
          alt="React Compact Toast Logo"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <div className="mb-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 bg-clip-text text-transparent">
          React Compact Toast
        </h1>
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            ✨ ~2.7 kB
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            🚀 Zero deps
          </span>
        </div>
      </div>
      <p className="text-lg md:text-xl text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
        Compact, easy-to-use toast notifications for React      </p>
    </div>
  );
} 