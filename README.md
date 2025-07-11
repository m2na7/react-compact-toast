# React Compact Toast

<img width="150" height="150" alt="icon" src="https://github.com/user-attachments/assets/e709a9fc-de08-4f64-9312-9c2011a6e17f" />


[![npm version](https://badge.fury.io/js/react-compact-toast.svg)](https://badge.fury.io/js/react-compact-toast)
[![npm downloads](https://img.shields.io/npm/dt/react-compact-toast.svg)](https://npmjs.com/package/react-compact-toast)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <strong>A tiny, compact, and fully customizable toast notification library for React applications.</strong>
</p>


<p align="center">
  <a href="https://react-compact-toast.vercel.app" target="_blank"><strong>🔗 Website</strong></a>
  <span> • </span>
  <a href="https://react-compact-toast.vercel.app/docs" target="_blank"><strong>📘 Docs</strong></a>
  <span> • </span>
  <a href="https://www.npmjs.com/package/react-compact-toast?activeTab=readme" target="_blank"><strong>📦 npm</strong></a>
</p>

<br />


## ✨ Features

- 🪶 **Lightweight**: ~2.7KB gzipped
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
