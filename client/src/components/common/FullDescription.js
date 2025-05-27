// ... existing code ...
"use client"
export default function FullDescription({ description, files, aiSummary }) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg text-gray-800 mb-2">Description</h2>
      <p className="mb-4 text-gray-800 whitespace-pre-line">{description}</p>
      {files && files.length > 0 && (
        <div>
          <h3 className="font-semibold mb-1 text-gray-800">Attachments</h3>
          {/* Render files here */}
        </div>
      )}
      {aiSummary && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4 text-gray-800">
          <strong>AI Summary:</strong> {aiSummary}
        </div>
      )}
    </div>
  )
}