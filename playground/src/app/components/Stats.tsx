export default function Stats() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="text-lg mr-2">📊</span>
        Stats
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Bundle Size</span>
          <span className="text-green-600 font-semibold text-sm">~2.7 kB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Dependencies</span>
          <span className="text-blue-600 font-semibold text-sm">Zero</span>
        </div>
      </div>
    </div>
  );
} 