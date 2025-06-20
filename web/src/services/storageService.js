// src/services/storageService.js
//
// This service handles file uploads to Firebase Storage in the StudyBuddy platform.
// It provides functionality for uploading multiple files with progress tracking
// and returns download URLs for the uploaded files.
//
// Features:
// - Multiple file upload support
// - Progress tracking for each file
// - Error handling for upload failures
// - Firebase Storage integration
// - Download URL generation

import { storage } from '@/src/firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Uploads multiple files to Firebase Storage and returns their download URLs
 * Supports progress tracking for each individual file
 * 
 * @param {File[]} files - Array of files to upload
 * @param {string} path - Storage path where files should be uploaded (e.g., 'uploads/questions')
 * @param {function} onProgress - Callback function to track upload progress
 *                              Called with (fileIndex, progressPercentage) for each file
 * @returns {Promise<string[]>} Array of download URLs for the uploaded files
 * @throws {Error} If upload fails or files array is empty
 */
export const uploadFiles = async (files, path, onProgress) => {
  // Validate input - return empty array if no files provided
  if (!files || files.length === 0) return [];

  try {
    // Create upload promises for all files
    const uploadPromises = files.map((file, index) => {
      // Create a unique storage reference for each file
      const storageRef = ref(storage, `${path}/${file.name}`);
      
      // Create upload task with resumable upload support
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Return a promise that resolves with the download URL
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Calculate and report progress for this file
            if (onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(index, progress);
            }
          },
          (error) => {
            // Reject promise if upload fails
            reject(error);
          },
          async () => {
            // Upload completed successfully - get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    });

    // Wait for all uploads to complete and return download URLs
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error; // Re-throw error for handling by calling code
  }
}; 