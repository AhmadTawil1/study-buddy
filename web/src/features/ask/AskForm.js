'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/src/context/themeContext'
import { useAskFormLogic } from '../../hooks/useAskFormLogic'
import { SUBJECTS } from '@/src/constants/askConfig'
import TitleInput from './components/TitleInput'
import DescriptionInput from './components/DescriptionInput'
import FileUpload from '@/src/components/common/FileUpload'
import TagInput from './components/TagInput'
import PrivacyToggle from './components/PrivacyToggle'
import CodeEditorSection from './CodeEditorSection'

export default function AskForm() {
  const { colors } = useTheme()
  const {
    // State
    title,
    description,
    subject,
    tags,
    isPrivate,
    isAnonymous,
    files,
    codeSnippet,
    showCodeEditor,
    customTag,
    clarityScore,
    loadingTitle,
    loadingDescription,
    loading,
    success,
    error,
    dragActive,
    codeLanguage,
    
    // Setters
    setTitle,
    setDescription,
    setSubject,
    setTags,
    setIsPrivate,
    setIsAnonymous,
    setFiles,
    setCodeSnippet,
    setShowCodeEditor,
    setCustomTag,
    setDragActive,
    setCodeLanguage,
    
    // Handlers
    handleSubmit,
    handleRephraseTitle,
    handleRephraseDescription,
    handleFiles,
    removeFile,
    addTag,
    removeTag,
    
    // Constants
    MAX_TITLE_LENGTH
  } = useAskFormLogic()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-xl shadow-lg p-8" style={{ background: colors.card, color: colors.text }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Ask a Question</h1>
        <p className="mb-8" style={{ color: colors.inputPlaceholder }}>Be clear. Be specific. We'll help.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg"
                style={{ background: colors.successBg, color: colors.successText }}
              >
                ✅ Question submitted successfully!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg"
                style={{ background: colors.errorBg, color: colors.errorText }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Input */}
          <TitleInput
            value={title}
            onChange={setTitle}
            onRephrase={handleRephraseTitle}
            loading={loadingTitle}
            clarityScore={clarityScore}
            maxLength={MAX_TITLE_LENGTH}
          />

          {/* Description Input */}
          <DescriptionInput
            value={description}
            onChange={setDescription}
            onRephrase={handleRephraseDescription}
            loading={loadingDescription}
          />

          {/* File Upload */}
          <FileUpload
            files={files}
            setFiles={setFiles}
            dragActive={dragActive}
            setDragActive={setDragActive}
            onFilesAdd={handleFiles}
            onFileRemove={removeFile}
          />

          {/* Tag/Subject Input */}
          <TagInput
            subject={subject}
            setSubject={setSubject}
            tags={tags}
            setTags={setTags}
            customTag={customTag}
            setCustomTag={setCustomTag}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            subjectsList={SUBJECTS}
          />

          {/* Code Snippet */}
          <CodeEditorSection
            show={showCodeEditor}
            onToggle={() => setShowCodeEditor(!showCodeEditor)}
            code={codeSnippet}
            onChange={setCodeSnippet}
            language={codeLanguage}
            setLanguage={setCodeLanguage}
          />

          {/* Privacy/Anonymous Toggle */}
          <PrivacyToggle
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md font-medium transition-colors"
              style={{ background: colors.button, color: colors.buttonSecondaryText, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
