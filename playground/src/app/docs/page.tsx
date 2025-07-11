import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-4xl w-full text-center">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              📚 Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Complete guide for React Compact Toast library
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 shadow-2xl mb-12">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚧</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Coming Soon!</h2>
              <p className="text-lg text-gray-300 max-w-lg mx-auto">
                Working on the docs!
                Detailed guides, API references, and examples are on the way.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-3xl mb-3">📖</div>
                <h3 className="text-lg font-semibold text-white mb-2">API Reference</h3>
                <p className="text-sm text-gray-400">Complete API documentation with all props and methods</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold text-white mb-2">Examples</h3>
                <p className="text-sm text-gray-400">Real-world examples and use cases</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-lg font-semibold text-white mb-2">Customization</h3>
                <p className="text-sm text-gray-400">Styling guides and theming options</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <span className="text-xl mr-2">🏠</span>
                  Back to Home
                </div>
              </Link>

              <a
                href="https://github.com/m2na7/react-compact-toast"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <span className="text-xl mr-2">⭐</span>
                  Star on GitHub
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 