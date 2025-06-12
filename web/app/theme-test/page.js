'use client';

import { useTheme } from '@/src/context/themeContext';
import Card from '@/src/components/common/Card';
import Button from '@/src/components/common/Button';
import Input from '@/src/components/common/Input';

export default function ThemeTestPage() {
  const { mode, colors } = useTheme();

  return (
    <div className="min-h-screen p-8 transition-colors duration-300" style={{ background: colors.page, color: colors.text }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>Theme Test Page</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Example with dynamic background */}
          <Card bgColor={colors.card}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Card Component</h2>
            <p className="text-base" style={{ color: colors.text }}>
              This card uses the dynamic card background color for the current mode.
            </p>
          </Card>
          {/* Card Example with another dynamic background */}
          <Card bgColor={mode === 'dark' ? '#23272f' : '#e0f2fe'}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Custom Card Background</h2>
            <p className="text-base" style={{ color: colors.text }}>
              This card uses a different dynamic background color for each mode.
            </p>
          </Card>
          {/* Form Elements */}
          <Card bgColor={colors.card}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Form Elements</h2>
            <div className="space-y-4">
              <Input
                placeholder="Text input"
                bgColor={colors.inputBg}
                borderColor={colors.inputBorder}
                textColor={colors.inputText}
                placeholderColor={colors.inputPlaceholder}
              />
              <select className="w-full p-2 rounded-lg transition-colors" style={{ background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.inputText }}>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </Card>
          {/* Buttons */}
          <Card bgColor={colors.card}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Buttons</h2>
            <div className="space-x-4">
              <Button bgColor={colors.button}>Primary</Button>
              <Button variant="secondary" bgColor={colors.buttonSecondary} style={{ color: colors.buttonSecondaryText }}>Secondary</Button>
            </div>
          </Card>
          {/* Text Styles */}
          <Card bgColor={colors.card}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Text Styles</h2>
            <p className="text-sm" style={{ color: colors.inputPlaceholder }}>Small text</p>
            <p className="text-base" style={{ color: colors.text }}>Regular text</p>
            <p className="text-lg font-medium" style={{ color: colors.text }}>Medium text</p>
            <p className="text-xl font-bold" style={{ color: colors.text }}>Bold text</p>
          </Card>
          {/* Status Messages */}
          <Card bgColor={colors.card}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Status Messages</h2>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border font-medium" style={{ background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.inputText }}>Neutral message with good contrast</div>
              <div className="p-3 rounded-lg border font-medium bg-[#fee2e2] border-[#ef4444] text-[#b91c1c] dark:bg-[#2d1a1a] dark:border-[#ef4444] dark:text-[#ef4444]">Error message example</div>
              <div className="p-3 rounded-lg border font-medium bg-[#dcfce7] border-[#22c55e] text-[#15803d] dark:bg-[#1a2d1a] dark:border-[#22c55e] dark:text-[#22c55e]">Success message example</div>
              <div className="p-3 rounded-lg border font-medium bg-[#fef9c3] border-[#f59e0b] text-[#b45309] dark:bg-[#2d291a] dark:border-[#fbbf24] dark:text-[#fbbf24]">Warning message example</div>
            </div>
          </Card>
          {/* Additional Contrast Examples */}
          <Card bgColor={colors.card}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Additional Examples</h2>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border font-medium" style={{ background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.inputText }}>Neutral message with good contrast</div>
              <div className="p-3 rounded-lg border font-medium bg-[#dbeafe] border-[#2563eb] text-[#2563eb] dark:bg-[#1a2233] dark:border-[#60a5fa] dark:text-[#60a5fa]">Info message with good contrast</div>
              <div className="p-3 rounded-lg border font-medium bg-[#f3e8ff] border-[#a21caf] text-[#a21caf] dark:bg-[#2d1a2d] dark:border-[#e879f9] dark:text-[#e879f9]">Custom message with good contrast</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 