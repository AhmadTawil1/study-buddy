const mockRequests = [
  {
    id: '123',
    title: 'Can someone help with Linear Algebra?',
    description: 'I’m stuck on eigenvectors and diagonalization. I don’t understand how to check if a matrix is diagonalizable.',
  },
  {
    id: '456',
    title: 'Stuck on recursion in JavaScript',
    description: 'Trying to solve a binary tree traversal problem and I keep getting stack overflow. Can someone walk me through how to write a recursive DFS?',
  },
]

export default function RequestDetailsPage({ params }) {
  const { id } = params

  const request = mockRequests.find((req) => req.id === id)

  if (!request) {
    return (
      <div className="min-h-screen py-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Request not found</h1>
        <p className="text-gray-600 mt-2">This request ID doesn't exist in our mock data.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">{request.title}</h1>
      <p className="text-gray-700 text-lg">{request.description}</p>
    </div>
  )
}
