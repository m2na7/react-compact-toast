import Image from 'next/image';

const LINKS = [
  { label: 'Docs', href: '/docs' },
  { label: 'GitHub', href: 'https://github.com/m2na7/react-compact-toast' },
  { label: 'npm', href: 'https://www.npmjs.com/package/react-compact-toast' },
];

const FACTS = [
  { value: '7.0 kB', label: 'gzipped' },
  { value: '3.1 kB', label: 'headless' },
  { value: '0', label: 'dependencies' },
  { value: '18 · 19', label: 'React' },
];

export default function Header() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-neutral-200 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
            <Image
              src="/logo.webp"
              alt=""
              width={20}
              height={20}
              className="object-contain"
            />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
            React Compact Toast
          </span>
        </div>

        <nav className="flex items-center gap-5 text-sm">
          {LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-blue-600 hover:underline underline-offset-4"
              {...(href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <header className="pb-9 pt-11">
        <h1 className="max-w-[22ch] text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          Toast notifications you can call from anywhere.
        </h1>
        <p className="mt-3.5 max-w-[48ch] text-[17px] leading-relaxed text-neutral-600">
          No provider to mount, no hook to declare. Import{' '}
          <code className="font-mono text-[0.875em] text-neutral-900">toast</code>{' '}
          and call it.
        </p>

        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
          {FACTS.map(({ value, label }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt className="sr-only">{label}</dt>
              <dd className="font-medium tabular-nums text-neutral-900">
                {value}
              </dd>
              <span aria-hidden="true">{label}</span>
            </div>
          ))}
        </dl>
      </header>
    </div>
  );
}
