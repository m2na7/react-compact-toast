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
      <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
        React Compact Toast
      </h1>
      <p className="text-base md:text-lg text-gray-600 font-normal max-w-xl mx-auto">
        A tiny, compact, and fully customizable toast notification library.
      </p>
    </div>
  );
} 