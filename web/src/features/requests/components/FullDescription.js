"use client"
import { useState } from 'react';
import Editor from '@monaco-editor/react'
import { requestService } from '@/src/services/requests/requestService';
import { useTheme } from '@/src/context/themeContext';

async function regenerateAIAnswer(requestId, title, description) {
  try {
    await fetch('/api/ai-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: `${title}\n${description}` })
    });
  } catch (e) {
    // Optionally handle error
  }
}

export default function FullDescription({ description, files, aiSummary, codeSnippet, codeLanguage, isOwner, requestId, title }) {
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { colors } = useTheme();

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
      let currentTitle = title;
      if (!currentTitle) {
        const req = await requestService.getRequestById(requestId);
        currentTitle = req?.title || '';
      }
      await regenerateAIAnswer(requestId, currentTitle, editDescription);
    } catch (e) {
      setError("Failed to update description. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="mb-6" style={{ color: colors.text }}>
      <h2 className="font-semibold text-lg mb-2 flex items-center" style={{ color: colors.text }}>
        Description
        {isOwner && !editing && (
          <button onClick={handleEdit} className="ml-3 text-base hover:underline" style={{ color: colors.button }}>Edit</button>
        )}
      </h2>
      {editing ? (
        <div>
          <textarea
            className="mb-2 w-full border rounded px-2 py-1"
            style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
            rows={5}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            disabled={saving}
          />
          <div className="flex gap-2 mb-2">
            <button onClick={handleSave} className="px-3 py-1 rounded" style={{ background: colors.button, color: colors.buttonSecondaryText }} disabled={saving}>Save</button>
            <button onClick={handleCancel} className="px-3 py-1 rounded" style={{ background: colors.inputBg, color: colors.text, border: `1px solid ${colors.inputBorder}` }} disabled={saving}>Cancel</button>
          </div>
          {error && <div className="text-sm mt-1" style={{ color: '#ef4444' }}>{error}</div>}
        </div>
      ) : (
        <p className="mb-4 whitespace-pre-line" style={{ color: colors.text }}>{description}</p>
      )}
      
      {codeSnippet && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2" style={{ color: colors.text }}>Code Snippet</h3>
          <div className="border rounded-lg overflow-hidden" style={{ height: '300px', background: colors.inputBg }}>
            <Editor
              height="100%"
              language={codeLanguage || 'plaintext'}
              value={codeSnippet}
              theme={colors.mode === 'dark' ? 'vs-dark' : 'vs-light'}
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
          <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Attachments</h3>
          <ul className="space-y-2">
            {files.map((url, idx) => (
              <li key={idx}>
                {url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Attachment ${idx + 1}`} className="max-h-40 rounded border mb-1" />
                  </a>
                ) : (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: colors.button }}>{`Attachment ${idx + 1}`}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {aiSummary && (
        <div className="p-3 mt-4" style={{ background: colors.mode === 'dark' ? '#1e293b' : '#dbeafe', borderLeft: `4px solid ${colors.button}`, color: colors.text }}>
          <strong style={{ color: colors.text }}>AI Summary:</strong> {aiSummary}
        </div>
      )}
    </div>
  )
}