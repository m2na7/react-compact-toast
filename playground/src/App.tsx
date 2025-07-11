import { toast, ToastContainer } from '../../src';

function App() {
  const showSimpleToast = () => {
    toast('Hello! This is a simple toast! 🎉');
  };

  const showCustomToast = () => {
    toast({
      text: 'Custom toast with options',
      icon: '🚀',
      position: 'topRight',
      className: 'custom-toast',
      highlightText: 'Custom',
      autoClose: 5000,
    });
  };

  const showBottomToast = () => {
    toast({
      text: 'Bottom left toast',
      icon: '⭐',
      position: 'bottomLeft',
      autoClose: 3000,
    });
  };

  const showTopCenterToast = () => {
    toast({
      text: 'Top center toast',
      position: 'topCenter',
      closeOnClick: false,
      autoClose: 4000,
    });
  };

  const showNoAutoCloseToast = () => {
    toast({
      text: "This toast won't auto close",
      icon: '🔒',
      position: 'bottomRight',
      autoClose: false,
      highlightText: "won't auto close",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 flex items-center justify-center p-5 font-sans">
      <div className="max-w-4xl w-full text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-shadow-lg">
          🍞 React Compact Toast Playground
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Test different toast configurations with Vite + Tailwind!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={showSimpleToast}
            className="px-6 py-3 text-base font-medium rounded-lg border-none text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-blue-600 hover:bg-blue-700"
          >
            Simple Toast
          </button>

          <button
            onClick={showCustomToast}
            className="px-6 py-3 text-base font-medium rounded-lg border-none text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-green-600 hover:bg-green-700"
          >
            Custom Toast (Top Right)
          </button>

          <button
            onClick={showBottomToast}
            className="px-6 py-3 text-base font-medium rounded-lg border-none text-gray-800 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-yellow-400 hover:bg-yellow-500"
          >
            Bottom Left Toast
          </button>

          <button
            onClick={showTopCenterToast}
            className="px-6 py-3 text-base font-medium rounded-lg border-none text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-red-600 hover:bg-red-700"
          >
            Top Center (No Click Close)
          </button>

          <button
            onClick={showNoAutoCloseToast}
            className="px-6 py-3 text-base font-medium rounded-lg border-none text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-purple-600 hover:bg-purple-700 md:col-span-2 lg:col-span-1"
          >
            No Auto Close
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mt-8 border border-white/20">
          <h3 className="text-xl font-semibold mb-4 mt-0">
            🧪 Testing Guide
          </h3>
          <ul className="text-left max-w-2xl mx-auto leading-relaxed space-y-2">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Click different buttons to test various toast positions
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Check animations (enter/exit)
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Test auto-close timing
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Try clicking toasts to close them manually
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              Test multiple toasts at the same time
            </li>
          </ul>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
