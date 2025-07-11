import { useState } from 'react';
import { toast } from '../../../../src';

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
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-2xl'
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

function App() {
  return (
    <div>
      <ToastContainer />
      <Component />
    </div>
  );
}

function Component() {
  return (
    <div>
      <button onClick={() => {
        toast({ text: "super easy!", position: "topRight" });
      }}>
        click me
      </button>
    </div>
  );
}`;

  const advancedUsageCode = `
toast({
  text: 'Custom notification',
  icon: <Icon />,
  position: 'topRight',
  autoClose: 5000,
  closeOnClick: true,
  className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl',
  highlightText: 'Custom'
});`;

  return (
    <div className="my-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="text-2xl mr-3">📋</span>
          Quick Start
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {/* Installation */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="text-lg mr-2">📦</span>
              Installation
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/50 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400 font-mono">Terminal</span>
                  <button
                    onClick={() => copyToClipboard(installCommands.npm, 'npm')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedId === 'npm' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="text-emerald-400 font-mono">{installCommands.npm}</code>
                </pre>
              </div>
              <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/50 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400 font-mono">Terminal</span>
                  <button
                    onClick={() => copyToClipboard(installCommands.yarn, 'yarn')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedId === 'yarn' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="text-emerald-400 font-mono">{installCommands.yarn}</code>
                </pre>
              </div>
              <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/50 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400 font-mono">Terminal</span>
                  <button
                    onClick={() => copyToClipboard(installCommands.pnpm, 'pnpm')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedId === 'pnpm' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="text-emerald-400 font-mono">{installCommands.pnpm}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Basic Usage */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="text-lg mr-2">🚀</span>
              Basic Usage
            </h3>
            <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/50 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-mono">JavaScript</span>
                <button
                  onClick={() => copyToClipboard(basicUsageCode, 'basic')}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {copiedId === 'basic' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="font-mono text-white">
                  <span className="text-purple-400">import</span>{' '}
                  <span className="text-yellow-400">{'{ ToastContainer, toast }'}</span>{' '}
                  <span className="text-purple-400">from</span>{' '}
                  <span className="text-green-400">'react-compact-toast'</span>;
                  {'\n\n'}
                  <span className="text-purple-400">function</span>{' '}
                  <span className="text-blue-400">App</span>() {'{'}
                  {'\n  '}
                  <span className="text-purple-400">return</span> (
                  {'\n    '}
                  <span className="text-red-400">&lt;</span><span className="text-white">div</span><span className="text-red-400">&gt;</span>
                  {'\n      '}
                  <span className="text-red-400">&lt;</span><span className="text-blue-400">ToastContainer</span> <span className="text-red-400">/&gt;</span>
                  {'\n      '}
                  <span className="text-red-400">&lt;</span><span className="text-blue-400">Component</span> <span className="text-red-400">/&gt;</span>
                  {'\n    '}
                  <span className="text-red-400">&lt;/</span><span className="text-white">div</span><span className="text-red-400">&gt;</span>
                  {'\n  '});
                  {'\n'}{'}'}

                  {'\n\n'}
                  <span className="text-purple-400">function</span>{' '}
                  <span className="text-blue-400">Component</span>() {'{'}
                  {'\n  '}
                  <span className="text-purple-400">return</span> (
                  {'\n    '}
                  <span className="text-red-400">&lt;</span><span className="text-white">div</span><span className="text-red-400">&gt;</span>
                  {'\n      '}
                  <span className="text-red-400">&lt;</span><span className="text-white">button</span>{' '}
                  <span className="text-yellow-400">onClick</span><span className="text-white">=&#123;</span>
                  {'() => {'}
                  {'\n        '}
                  <span className="text-blue-400">toast</span>({`{`} text: <span className="text-green-400">"super easy!"</span>, position: <span className="text-green-400">"topRight"</span> {`}`});
                  {'\n      }'}
                  <span className="text-red-400">&gt;</span>
                  click me
                  <span className="text-red-400">&lt;/</span><span className="text-white">button</span><span className="text-red-400">&gt;</span>
                  {'\n    '}
                  <span className="text-red-400">&lt;/</span><span className="text-white">div</span><span className="text-red-400">&gt;</span>
                  {'\n  '});
                  {'\n'}{'}'}
                </code>
              </pre>
            </div>
          </div>

          {/* Advanced Usage */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="text-lg mr-2">⚙️</span>
              Advanced Options
            </h3>
            <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/50 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-mono">JavaScript</span>
                <button
                  onClick={() => copyToClipboard(advancedUsageCode, 'advanced')}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {copiedId === 'advanced' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="font-mono text-white">
                  <span className="text-gray-500">// Custom toast with options</span>
                  {'\n'}
                  <span className="text-blue-400">toast</span>({'{'}
                  {'\n  '}
                  <span className="text-cyan-400">text</span>: <span className="text-green-400">'Custom notification'</span>,
                  {'\n  '}
                  <span className="text-cyan-400">icon</span>: <span className="text-green-400">{'<Icon />'}</span>,
                  {'\n  '}
                  <span className="text-cyan-400">highlightText</span>: <span className="text-green-400">'Custom'</span>,
                  {'\n  '}
                  <span className="text-cyan-400">highlightColor</span>: <span className="text-green-400">'#FF6B6B'</span>,
                  {'\n  '}
                  <span className="text-cyan-400">autoClose</span>: <span className="text-orange-400">5000</span>,
                  {'\n  '}
                  <span className="text-cyan-400">closeOnClick</span>: <span className="text-orange-400">true</span>,
                  {'\n  '}
                  <span className="text-cyan-400">position</span>: <span className="text-green-400">'topRight'</span>,
                  {'\n  '}
                  <span className="text-cyan-400">className</span>: <span className="text-green-400">'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl'</span>
                  {'\n'}{'}'};
                  {'\n\n'}
                  <span className="text-gray-500">// Available positions:</span>
                  {'\n'}
                  <span className="text-gray-500">// 'topLeft' | 'topCenter' | 'topRight' |</span>
                  {'\n'}
                  <span className="text-gray-500">// 'bottomLeft' | 'bottomCenter' | 'bottomRight'</span>
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <p className="text-emerald-200 text-sm">
            <span className="font-semibold">🎯 Pro Tip:</span> You can fully style your toasts using <code>className</code> — Tailwind, Emotion, Vanilla E, or plain CSS — it's all up to you!
          </p>
        </div>
      </div>
    </div>
  );
} 