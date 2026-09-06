import Header from './components/Hero';
import QuickStart from './components/QuickStart';
import InteractiveDemo from './components/InteractiveDemo';
import Features from './components/Features';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-neutral-50">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <Header />

      <div className="relative z-10 px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
            <div className="order-1 lg:col-span-3">
              <InteractiveDemo />
            </div>

            <div className="order-2 lg:col-span-1">
              <div className="sticky top-6">
                <Features />
              </div>
            </div>
          </div>

          <div className="mt-12">
            <QuickStart />
          </div>

          <div className="mt-24">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
