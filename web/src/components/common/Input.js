import React from 'react';
import { useTheme } from '@/src/context/themeContext';

export default function Input({
  className = '',
  bgColor,
  borderColor,
  textColor,
  placeholderColor,
  as,
  ...props
}) {
  const { colors } = useTheme();
  const resolvedTextColor = textColor || colors.inputText;
  const resolvedPlaceholderColor = placeholderColor || colors.inputPlaceholder;
  const style = {
    background: bgColor,
    border: `1px solid ${borderColor}`,
    color: resolvedTextColor,
    ...props.style,
  };
  // For placeholder color, use a style tag for input/textarea
  const inputProps = {
    ...props,
    className: `p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 shadow-sm ${className}`,
    style,
    placeholder: props.placeholder,
  };
  if (as === 'textarea') {
    return (
      <>
        <style>{`
          textarea::placeholder { color: ${resolvedPlaceholderColor} !important; opacity: 1; }
        `}</style>
        <textarea {...inputProps} />
      </>
    );
  }
  return (
    <>
      <style>{`
        input::placeholder { color: ${resolvedPlaceholderColor} !important; opacity: 1; }
      `}</style>
      <input {...inputProps} />
    </>
  );
} 