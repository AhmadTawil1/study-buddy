"use client"
export default function FullDescription({ description, files, aiSummary }) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg text-gray-800 mb-2">Description</h2>
      <p className="mb-4 text-gray-800 whitespace-pre-line">{description}</p>
      {files && files.length > 0 && (
        <div>
          <h3 className="font-semibold mb-1 text-gray-800">Attachments</h3>
          <ul className="space-y-2">
            {files.map((url, idx) => (
              <li key={idx}>
                {url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Attachment ${idx + 1}`} className="max-h-40 rounded border mb-1" />
                  </a>
                ) : (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {`Attachment ${idx + 1}`}
                  </a>
                )}
              </li>
            ))}
          </ul>
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