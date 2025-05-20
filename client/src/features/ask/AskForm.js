"use client"

export default function AskForm() {
  return (
    <form className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-blue-700 font-semibold mb-1">Title</label>
        <input
          type="text"
          placeholder="Enter your question title"
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
      </div>
      <div>
        <label className="block text-blue-700 font-semibold mb-1">Description</label>
        <textarea
          rows="5"
          placeholder="Describe your question..."
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  )
}
