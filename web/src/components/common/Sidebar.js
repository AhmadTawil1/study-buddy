"use client"
import React from 'react';
import { useTheme } from '@/src/context/themeContext';

export default function Sidebar({ children, className = '' }) {
  const { colors } = useTheme();
  return (
    <aside
      className={`sticky top-8 flex flex-col gap-6 ${className}`}
      style={{ color: colors.text }}
    >
      {children}
    </aside>
  );
}