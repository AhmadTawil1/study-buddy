'use client'
import { FiCode } from 'react-icons/fi'
import Editor from '@monaco-editor/react'
import { useTheme } from '@/src/context/themeContext'
import { CODE_LANGUAGES } from '@/src/constants/askConfig'

export default function CodeEditorSection({
  show,
  onToggle,
  code,
  onChange,
  language,
  setLanguage
}) {
  const { colors, mode } = useTheme()

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium rounded px-4 py-2 mt-2 mb-2"
        style={{ background: colors.button, color: colors.buttonSecondaryText }}
      >
        <FiCode />
        {show ? 'Hide Code Editor' : 'Add Code Snippet'}
      </button>
      {show && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm" style={{ color: colors.text }}>Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ background: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }}
            >
              {CODE_LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="border rounded-lg overflow-hidden" style={{ height: '300px', background: colors.inputBg, borderColor: colors.inputBorder }}>
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={onChange}
              theme={mode === 'dark' ? 'vs-dark' : 'vs-light'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
} 