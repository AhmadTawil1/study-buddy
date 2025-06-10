'use client'

import React, { useRef, useState } from 'react'
import { FiUpload, FiX, FiLoader } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function FileUpload({ files, setFiles, dragActive, setDragActive, onFilesAdd, onFileRemove }) {
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

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
      onFilesAdd(e.dataTransfer.files)
    }
  }

  const handleFiles = (fileList) => {
    setError('')
    const newFiles = Array.from(fileList)
    if (newFiles.length > 0) {
      onFilesAdd(newFiles)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Attach Files
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
            multiple
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop files here, or{' '}
            <span className="text-blue-600 hover:text-blue-700">
              browse
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports: Any file type
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
              className="flex items-center justify-between bg-gray-50 p-2 rounded"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{file.name}</span>
                {file.uploadProgress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(file.uploadProgress)}%</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onFileRemove(index)}
                className="text-red-600 hover:text-red-700"
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