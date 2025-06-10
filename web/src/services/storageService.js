import { storage } from '@/src/firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
    const uploadPromises = files.map((file, index) => {
      const storageRef = ref(storage, `${path}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(index, progress);
            }
          },
          (error) => {
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}; 