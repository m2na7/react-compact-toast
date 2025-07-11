import Image from 'next/image';

export default function Header() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-6 shadow-2xl overflow-hidden">
        <Image
          src="/logo.webp"
          alt="React Compact Toast Logo"
          width={48}
          height={48}
          className="object-contain"
        />
      </div>
      <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
        React Compact Toast
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 font-light">
        A tiny, compact, and fully customizable toast notification library.
      </p>
    </div>
  );
} 