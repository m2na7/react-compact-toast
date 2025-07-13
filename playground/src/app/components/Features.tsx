export default function Features() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="text-lg mr-2">🎯</span>
        Features
      </h3>
      <ul className="space-y-2.5 text-gray-700">
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Multiple positions supported</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Fully type-safe API</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Auto-close timing</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Click to dismiss</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Easily style with any CSS framework</span>
        </li>
      </ul>
    </div>
  );
} 