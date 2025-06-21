export function handleFiles(fileList, prevFiles = []) {
  const newFiles = Array.from(fileList);
  return [...prevFiles, ...newFiles];
}

export function removeFile(files, index) {
  return files.filter((_, i) => i !== index);
}

export function updateFileProgress(files, fileName, progress) {
  return files.map(file => 
    file.name === fileName ? { ...file, uploadProgress: progress } : file
  );
} 