// ... existing code ...
"use client"
export default function AnswerSection({ answers, requestId }) {
  return (
    <div>
      <h2 className="font-semibold text-lg text-gray-800 mb-4">Answers ({answers.length})</h2>
      {answers.map(ans => (
        <div key={ans.id} className="border rounded p-3 mb-3 bg-white">
          <div className="font-semibold text-gray-900">{ans.author} <span className="text-xs text-gray-500">({ans.badge})</span></div>
          <div className="mb-2 text-gray-800">{ans.content}</div>
          <div className="flex gap-2">
            <button className="text-blue-600 font-medium hover:underline">Upvote ({ans.upvotes})</button>
            <button className="text-blue-600 font-medium hover:underline">Mark as Helpful</button>
            <button className="text-blue-600 font-medium hover:underline">Comment</button>
          </div>
        </div>
      ))}
      <form className="mt-4">
        <textarea placeholder="Add your answer..." className="w-full border rounded p-2 mb-2 text-gray-900" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Submit Answer</button>
      </form>
      <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700">I Can Help</button>
    </div>
  )
}