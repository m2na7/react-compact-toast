export default function Stats() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="text-2xl mr-3">📊</span>
        Stats
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Bundle Size</span>
          <span className="text-green-400 font-semibold text-sm">~57.8 KB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Dependencies</span>
          <span className="text-blue-400 font-semibold text-sm">Zero</span>
        </div>
      </div>
    </div>
  );
} 