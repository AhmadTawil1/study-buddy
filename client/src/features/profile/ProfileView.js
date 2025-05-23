'use client'

export default function ProfileView() {
  const user = {
    name: 'Ahmad Tawil',
    joined: 'Jan 2024',
    badges: ['AI Explorer', 'Math Helper'],
    questionsAsked: 4,
    answersGiven: 15,
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">{user.name}</h2>
      <p className="text-sm text-gray-600 mb-4">Joined: {user.joined}</p>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Stats:</h3>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>Questions Asked: {user.questionsAsked}</li>
          <li>Answers Given: {user.answersGiven}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Badges:</h3>
        <div className="flex gap-2 flex-wrap">
          {user.badges.map((badge, i) => (
            <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
    
  )
}
