'use client'

const mockData = {
  '123': {
    title: 'Can someone explain linear regression?',
    tag: 'AI',
    posted: '2 hours ago',
    description: `I'm struggling to understand the cost function and how gradient descent actually reduces the loss. Also confused about how to choose learning rate.`,
  },
  '456': {
    title: 'How to solve 3-variable equations in Python?',
    tag: 'Math',
    posted: '1 day ago',
    description: `I want to learn how to solve three linear equations using numpy or sympy. I don't fully understand the matrix representation of the equations.`,
  },
}

export default function RequestDetails({ params }) {
  const request = mockData[params.id]

  if (!request) {
    return <div className="text-center text-red-600 mt-20">❌ Request not found</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 bg-white rounded-xl shadow-md mt-10 border border-gray-100">
      <p className="text-sm text-gray-500 mb-2">Posted: {request.posted}</p>
      <h1 className="text-2xl font-bold text-blue-800 mb-4">{request.title}</h1>
      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full mb-6">{request.tag}</span>

      <div className="text-gray-800 leading-relaxed">
        {request.description}
      </div>

      {/* Future: Add answer form or comment section */}
    </div>
  )
}
