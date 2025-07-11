import { toast } from 'react-compact-toast';

export default function InteractiveDemo() {
  const showSimpleToast = () => {
    toast('Hello! This is a simple toast!');
  };

  const showWithIcon = () => {
    toast({
      text: 'with custom icon',
      icon: '🚀',
      position: 'topRight',
      className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl',
      autoClose: 5000,
    });
  };

  const showNoAutoClose = () => {
    toast({
      text: 'Click to close !',
      position: 'topCenter',
      className: 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-2xl',
      autoClose: false,
      closeOnClick: true,
    });
  };

  const showCustomPosition = () => {
    toast({
      text: 'Bottom left positioned toast',
      position: 'bottomLeft',
      className: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-2xl shadow-2xl',
      autoClose: 5000,
    });
  };

  const showCustomStyle = () => {
    toast({
      text: ' uploaded and processed. Click here to view details or dismiss this notification.',
      position: 'topLeft',
      className: 'w-100 h-32 bg-white text-gray-800 rounded-2xl shadow-2xl border-l-8 border-green-500 p-6 flex flex-col justify-between hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1',
      highlightText: 'Successfully',
      highlightColor: '#10B981',
      autoClose: 10000,
    });
  };

  const showWithHighlight = () => {
    toast({
      text: ' text',
      icon: '✨',
      position: 'bottomRight',
      className: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-2xl shadow-2xl',
      highlightText: 'Highlighted',
      highlightColor: '#FFD700',
      autoClose: 5000,
    });
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
          Interactive Demo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={showSimpleToast}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <span className="text-xl mr-2">🎉</span>
              Simple Toast
            </div>
          </button>

          <button
            onClick={showWithIcon}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <span className="text-xl mr-2">🚀</span>
              With Icon
            </div>
          </button>

          <button
            onClick={showNoAutoClose}
            className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <span className="text-xl mr-2">📌</span>
              No Auto Close
            </div>
          </button>

          <button
            onClick={showCustomPosition}
            className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <span className="text-xl mr-2">📍</span>
              Custom Position
            </div>
          </button>

          <button
            onClick={showCustomStyle}
            className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <span className="text-xl mr-2">🎨</span>
              Custom Style
            </div>
          </button>

          <button
            onClick={showWithHighlight}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <span className="text-xl mr-2">✨</span>
              With Highlight
            </div>
          </button>
        </div>

        <div className="mt-7 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <p className="text-blue-200 text-sm">
            <span className="font-semibold">💡 Tip:</span> Click buttons to test different toast features and configurations
          </p>
        </div>
      </div>
    </div>
  );
} 