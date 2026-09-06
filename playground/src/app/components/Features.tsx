
export default function Features() {
  const features = [
    'Screen reader and keyboard ready',
    'Pauses on hover and focus',
    'Promise and loading helpers',
    'Multiple positioning options',
    'Works with any CSS framework',
    'Fully type-safe API',
  ];

  return (
    <div
      className="backdrop-blur-xl bg-white/60 border border-neutral-200/50 rounded-3xl p-5 shadow-xl shadow-neutral-900/5"
    >
      <h2
        className="text-lg font-semibold text-neutral-900 mb-4"
      >
        Features
      </h2>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center text-sm text-neutral-700"
          >
            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mr-3 flex-shrink-0"></div>
            {feature}
          </li>
        ))}
      </ul>

      <div
        className="mt-8 pt-4 border-t border-neutral-200/60"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[13px] text-neutral-600">
            <span>Bundle size (gzip)</span>
            <span className="font-medium">7.0 kB</span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-neutral-600">
            <span>Headless entry</span>
            <span className="font-medium">3.1 kB</span>
          </div>
        </div>
      </div>
    </div>
  );
}