// src/components/layout/Footer.js

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 border-t mt-16 text-sm text-gray-500">
      <p>© {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
    </footer>
  )
}
