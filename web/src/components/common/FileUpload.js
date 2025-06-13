'use client'

import React, { useRef, useState } from 'react'
import { FiUpload, FiX, FiLoader } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/src/context/themeContext'

/**
 * A reusable file upload component that supports both controlled and uncontrolled usage.
 * 
 * @param {Object} props
 * @param {File[]} [props.files] - Array of files (for controlled mode)
 * @param {Function} [props.onFilesAdd] - Callback when files are added (for controlled mode)
 * @param {Function} [props.onFileRemove] - Callback when a file is removed (for controlled mode)
 * @param {Function} [props.onChange] - Callback when files change (for uncontrolled mode)
 * @param {string} [props.label] - Label text for the upload area
 * @param {string} [props.supportedTypes] - Text describing supported file types
 * @param {boolean} [props.multiple] - Whether to allow multiple file selection
 * @param {string} [props.className] - Additional classes for the container
 */
export default function FileUpload({
  files: controlledFiles,
  onFilesAdd,
  onFileRemove,
  onChange,
  label = 'Attach Files',
  supportedTypes = 'Any file type',
  multiple = true,
  className = '',
}) {
  const { colors } = useTheme()
  const [uncontrolledFiles, setUncontrolledFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Use controlled or uncontrolled state
  const files = controlledFiles || uncontrolledFiles
  const setFiles = (newFiles) => {
    if (controlledFiles !== undefined) {
      onFilesAdd?.(newFiles)
    } else {
      setUncontrolledFiles(newFiles)
      onChange?.(newFiles)
    }
  }

  const removeFile = (index) => {
    if (controlledFiles !== undefined) {
      onFileRemove?.(index)
    } else {
      const newFiles = [...uncontrolledFiles]
      newFiles.splice(index, 1)
      setUncontrolledFiles(newFiles)
      onChange?.(newFiles)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (fileList) => {
    setError('')
    const newFiles = Array.from(fileList)
    if (newFiles.length > 0) {
      setFiles(newFiles)
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
        {label}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
          <FiUpload className="mx-auto h-12 w-12" style={{ color: colors.inputPlaceholder }} />
          <p className="mt-2 text-sm" style={{ color: colors.text }}>
            Drag and drop files here, or{' '}
            <span className="text-blue-600 hover:text-blue-700">
              browse
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: colors.inputPlaceholder }}>
            Supports: {supportedTypes}
          </p>
        </label>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded transition-colors duration-200"
              style={{ background: colors.inputBg }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: colors.text }}>{file.name}</span>
                {file.uploadProgress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: colors.inputBorder }}>
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: colors.inputPlaceholder }}>
                      {Math.round(file.uploadProgress)}%
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-700 transition-colors duration-200"
                disabled={file.uploadProgress !== undefined && file.uploadProgress < 100}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 