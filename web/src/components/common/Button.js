import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  bgColor,
  ...props
}) {
  let base =
    'inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 shadow-md';
  let variants = {
    primary:
      'text-white border border-transparent dark:text-white focus:ring-[#2563eb] dark:focus:ring-[#2563eb]',
    secondary:
      'text-black border border-black hover:bg-gray-100 dark:text-white dark:border-white dark:hover:bg-[#181818] focus:ring-black dark:focus:ring-white',
  };
  return (
    <button
      className={`${base} ${variants[variant] || ''} ${className}`}
      style={bgColor ? { background: bgColor } : undefined}
      {...props}
    >
      {children}
    </button>
  );
} 