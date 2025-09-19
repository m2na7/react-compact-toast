import { useState } from 'react';
import { toast } from '../../../../src/core/toast';
import CodeBlock from './CodeBlock';

export default function QuickStart() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);

      let position: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' = 'topRight';

      switch (id) {
        case 'npm':
          position = 'topLeft';
          break;
        case 'yarn':
          position = 'topCenter';
          break;
        case 'pnpm':
          position = 'topRight';
          break;
        case 'basic':
          position = 'bottomLeft';
          break;
        case 'advanced':
          position = 'bottomCenter';
          break;
        default:
          position = 'topRight';
      }

      toast({
        text: 'Code copied to clipboard! 📋',
        icon: '✅',
        position: position,
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const installCommands = {
    npm: 'npm install react-compact-toast',
    yarn: 'yarn add react-compact-toast',
    pnpm: 'pnpm add react-compact-toast'
  };

  const basicUsageCode = `import { ToastContainer, toast } from 'react-compact-toast';

function Component() {
  return (
    <div>
      <button onClick={() => {
        toast({ text: "super easy!", position: "topRight" });
      }}>
        click me
      </button>
      <ToastContainer />
    </div>
  );
}`;

  const advancedUsageCode = `// Custom toast with options
toast({
  text: 'Custom notification',
  icon: <Icon />,
  highlightText: 'Custom',
  highlightColor: '#FF6B6B',
  autoClose: 5000,
  closeOnClick: true,
  position: 'topRight',
  offset: '80px',
  className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl'
};

// Available positions:
// 'topLeft' | 'topCenter' | 'topRight' |
// 'bottomLeft' | 'bottomCenter' | 'bottomRight'`;

  return (
    <div className="my-10">
      <div className="backdrop-blur-xl bg-white/60 border border-neutral-200/50 rounded-3xl p-4 md:p-6 shadow-xl shadow-neutral-900/5">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center">
          Quick Start
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Installation */}
          <div className="lg:col-span-1">
            <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center">
              <span className="text-sm mr-2">📦</span>
              Installation
            </h3>
            <div className="space-y-3">
              {Object.entries(installCommands).map(([manager, command]) => (
                <div key={manager} className="relative group">
                  <div className="absolute top-2 right-3 z-10">
                    <button
                      onClick={() => copyToClipboard(command, manager)}
                      className="text-xs text-gray-400 hover:text-gray-200 transition-all duration-200 bg-black/10 hover:bg-black/20 px-2 py-1 rounded border border-white/10 hover:border-white/20 backdrop-blur-sm"
                    >
                      {copiedId === manager ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <CodeBlock language="bash">
                    {command}
                  </CodeBlock>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Usage */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center">
              <span className="text-sm mr-2">🚀</span>
              Basic Usage
            </h3>
            <div className="relative group">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => copyToClipboard(basicUsageCode, 'basic')}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-all duration-200 bg-black/10 hover:bg-black/20 px-2 py-1 rounded border border-white/10 hover:border-white/20 backdrop-blur-sm"
                >
                  {copiedId === 'basic' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <CodeBlock language="javascript">
                {basicUsageCode}
              </CodeBlock>
            </div>
          </div>

          {/* Advanced Usage */}
          <div className="col-span-1 lg:col-span-3">
            <h3 className="text-base font-medium mb-3 flex items-center">
              <span className="text-sm mr-2">⚙️</span>
              Advanced Options
            </h3>
            <div className="relative group">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => copyToClipboard(advancedUsageCode, 'advanced')}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-all duration-200 bg-black/10 hover:bg-black/20 px-2 py-1 rounded border border-white/10 hover:border-white/20 backdrop-blur-sm"
                >
                  {copiedId === 'advanced' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <CodeBlock language="javascript">
                {advancedUsageCode}
              </CodeBlock>
            </div>
          </div>
        </div>

        <div className="mt-5 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-emerald-700 text-sm">
            <span className="font-medium">🎯 Pro Tip:</span> You can fully style your toasts using <code className="bg-emerald-100 px-1 rounded text-emerald-800">className</code> — Tailwind, Emotion, Vanilla CSS, or plain CSS — it's all up to you!
          </p>
        </div>
      </div>
    </div>
  );
}