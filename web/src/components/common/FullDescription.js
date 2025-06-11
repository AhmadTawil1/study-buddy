"use client"
import { useState } from 'react';
import Editor from '@monaco-editor/react'
import { requestService } from '@/src/services/requestService';

export default function FullDescription({ description, files, aiSummary, codeSnippet, codeLanguage, isOwner, requestId }) {
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleEdit = () => {
    setEditing(true);
    setEditDescription(description);
    setError("");
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!editDescription.trim()) {
      setError("Description cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await requestService.updateRequest(requestId, { description: editDescription });
      setEditing(false);
    } catch (e) {
      setError("Failed to update description. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg text-gray-800 mb-2 flex items-center">
        Description
        {isOwner && !editing && (
          <button onClick={handleEdit} className="ml-3 text-blue-600 hover:underline text-base">Edit</button>
        )}
      </h2>
      {editing ? (
        <div>
          <textarea
            className="mb-2 w-full border border-gray-300 rounded px-2 py-1 text-gray-800"
            rows={5}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            disabled={saving}
          />
          <div className="flex gap-2 mb-2">
            <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={saving}>Save</button>
            <button onClick={handleCancel} className="bg-gray-200 px-3 py-1 rounded" disabled={saving}>Cancel</button>
          </div>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </div>
      ) : (
        <p className="mb-4 text-gray-800 whitespace-pre-line">{description}</p>
      )}
      
      {codeSnippet && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-800">Code Snippet</h3>
          <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <Editor
              height="100%"
              language={codeLanguage || 'plaintext'}
              value={codeSnippet}
              theme="vs-light"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      )}

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