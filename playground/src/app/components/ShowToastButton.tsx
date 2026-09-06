interface ShowToastButtonProps {
  onClick: () => void;
  color: 'neutral' | 'emerald' | 'amber' | 'red' | 'blue' | 'white' | 'purple';
  children: React.ReactNode;
}

export default function ShowToastButton({
  onClick,
  color,
  children,
}: ShowToastButtonProps) {
  const colorConfigs = {
    neutral: {
      button:
        'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300',
      text: 'text-neutral-700',
      dot: 'bg-neutral-400 group-hover:bg-neutral-600',
    },
    emerald: {
      button:
        'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300',
      text: 'text-emerald-700',
      dot: 'bg-emerald-400 group-hover:bg-emerald-600',
    },
    amber: {
      button:
        'border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300',
      text: 'text-amber-700',
      dot: 'bg-amber-400 group-hover:bg-amber-600',
    },
    red: {
      button: 'border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300',
      text: 'text-red-700',
      dot: 'bg-red-400 group-hover:bg-red-600',
    },
    blue: {
      button:
        'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300',
      text: 'text-blue-700',
      dot: 'bg-blue-400 group-hover:bg-blue-600',
    },
    white: {
      button:
        'border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300',
      text: 'text-neutral-700',
      dot: 'bg-neutral-400 group-hover:bg-neutral-600',
    },
    purple: {
      button:
        'border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300',
      text: 'text-purple-600',
      dot: 'bg-purple-400 group-hover:bg-purple-600',
    },
  };

  const config = colorConfigs[color];

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center gap-2 rounded-2xl border p-3 transition-all duration-200 active:scale-[0.98] sm:p-4 ${config.button}`}
    >
      <div className={`h-2 w-2 rounded-full transition-colors ${config.dot}`} />
      <span className={`text-xs font-medium sm:text-sm ${config.text}`}>
        {children}
      </span>
    </button>
  );
}
