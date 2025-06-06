import { storage } from '@/src/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads files to Firebase Storage and returns their download URLs
 * @param {File[]} files - Array of files to upload
 * @param {string} path - Storage path where files should be uploaded
 * @param {function} onProgress - Callback function to track upload progress
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadFiles = async (files, path, onProgress) => {
  if (!files || files.length === 0) return [];

  try {
    const uploadPromises = files.map(async (file, index) => {
      const storageRef = ref(storage, `${path}/${file.name}`);
      
      // Create upload task
      const uploadTask = uploadBytes(storageRef, file);
      
      // Track progress if callback provided
      if (onProgress) {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(index, progress);
          },
          (error) => {
            console.error('Upload error:', error);
            throw error;
          }
        );
      }

      // Wait for upload to complete
      await uploadTask;
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}; 