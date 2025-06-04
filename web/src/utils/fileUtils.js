export function handleFiles(fileList, prevFiles = []) {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const newFiles = Array.from(fileList).filter(file => validTypes.includes(file.type));
  return [...prevFiles, ...newFiles];
}

export function removeFile(files, index) {
  return files.filter((_, i) => i !== index);
} 