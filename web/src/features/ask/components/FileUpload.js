'use client'

import React, { useRef, useState } from 'react'
import { FiUpload, FiX, FiLoader } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function FileUpload({ files, setFiles, dragActive, setDragActive, onFilesAdd, onFileRemove }) {
  const [uploadingFiles, setUploadingFiles] = useState({})
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
    const newFiles = Array.from(fileList).filter(file => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      if (!validTypes.includes(file.type)) {
        setError(`File type ${file.type} is not supported`)
        return false
      }
      return true
    })

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      // Set uploading state for each new file
      const newUploadingFiles = {}
      newFiles.forEach(file => {
        newUploadingFiles[file.name] = true
      })
      setUploadingFiles(prev => ({ ...prev, ...newUploadingFiles }))
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    // Remove from uploading state
    const fileName = files[index].name
    setUploadingFiles(prev => {
      const newState = { ...prev }
      delete newState[fileName]
      return newState
    })
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
            Supports: Images, PDFs, .txt, .docx
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
                {uploadingFiles[file.name] && (
                  <FiLoader className="animate-spin text-blue-600" />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-700"
                disabled={uploadingFiles[file.name]}
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