import { storage } from '@/src/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadFiles = async (files, userId) => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `attachments/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  });

  try {
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error; // Re-throw the error to be handled in the calling function
  }
}; 