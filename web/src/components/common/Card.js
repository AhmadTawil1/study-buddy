import React from 'react';

export default function Card({ children, className = '', bgColor, ...props }) {
  // Determine background based on dark mode
  // Use Tailwind's dark: selector for className, but for inline style, check document.documentElement.classList
  let defaultBg = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'rgba(30,32,40,0.85)'
    : 'rgba(255,255,255,0.90)';

  // Fallback for SSR: use prefers-color-scheme
  if (typeof window === 'undefined') {
    defaultBg = 'rgba(255,255,255,0.90)';
  }

  return (
    <div
      className={`p-8 rounded-2xl border shadow-xl transition-all duration-300 border-gray-200 dark:border-white/10 text-black dark:text-white backdrop-blur-md ${className}`}
      style={bgColor ? { background: bgColor } : { background: defaultBg, ...(props.style || {}) }}
      {...props}
    >
      {children}
    </div>
  );
} 