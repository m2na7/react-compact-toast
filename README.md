
<div align="center">
  <img src="https://github.com/user-attachments/assets/e709a9fc-de08-4f64-9312-9c2011a6e17f" alt="Shizue Logo" width="64" />
  <h1>React Compact Toast</h1>
  <div align="center">

![npm](https://img.shields.io/npm/v/react-compact-toast.svg?logo=npm)
[![npm downloads](https://img.shields.io/npm/dt/react-compact-toast.svg?color=yellow)](https://npmjs.com/package/react-compact-toast)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/m2na7/react-compact-toast/graph/badge.svg?token=YWV9W9GTVN)](https://codecov.io/gh/m2na7/react-compact-toast)
![zip](https://badgen.net/bundlephobia/minzip/react-compact-toast)


</div>
  <p>Compact, easy-to-use toast notifications for React</p>
</div>

<div align="center">
  <p>
    <a style="font-size: 28px" href="https://react-compact-toast.vercel.app">
      🍞 WebSite 
    </a>
  </p>
</div>


## ✨ Features

- 🪶 **Lightweight**: ≈2KB gzipped
- 🎯 **Zero dependencies**: No external dependencies
- 🎨 **Fully customizable**: Style with any CSS framework (Tailwind, Emotion, etc.)
- ⚡ **Fast**: Optimized for performance
- 🔧 **TypeScript**: Full TypeScript support
- 🎭 **Flexible**: Custom icons, colors, and animations

## 📦 Installation

```bash
# npm
npm install react-compact-toast

# yarn
yarn add react-compact-toast

# pnpm
pnpm add react-compact-toast
```

## 🚀 Quick Start

```jsx
import { ToastContainer, toast } from 'react-compact-toast';

function App() {
  return (
    <div>
      <ToastContainer />
      <button
        onClick={() => toast({ text: 'Hello World!', position: 'topRight' })}
      >
        Show Toast
      </button>
    </div>
  );
}
```

## 📖 Basic Usage

### 1. Add ToastContainer

Add the `ToastContainer` component to your app (usually in your main App component):

```jsx
import { ToastContainer } from 'react-compact-toast';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ToastContainer />
    </div>
  );
}
```

### 2. Show Toasts

```jsx
import { toast } from 'react-compact-toast';

// Simple toast
toast('Hello World!');

// Toast with options
toast({
  text: 'Custom notification',
  position: 'topRight',
  autoClose: 5000,
  icon: '🎉',
});
```

## Documentation

Find the full API reference on [documentation](https://react-compact-toast.vercel.app/docs).
