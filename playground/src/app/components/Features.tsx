export default function Features() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="text-2xl mr-3">🎯</span>
        Features
      </h3>
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Multiple positions supported</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Customizable animations</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Auto-close timing</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Click to dismiss</span>
        </li>
        <li className="flex items-start">
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Tailwind CSS styling</span>
        </li>
      </ul>
    </div>
  );
} 