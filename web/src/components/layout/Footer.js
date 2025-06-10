// src/components/layout/Footer.js
//
// This is the global footer for the StudyBuddy app.
// It appears at the bottom of every page (via app/layout.js).
//
// Features:
// - Brand/logo
// - Social media links
// - Quick links (docs, contact, terms, etc.)
// - Language selector
// - Copyright notice

"use client"
import Link from 'next/link'
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi'
import { useState } from 'react'

export default function Footer() {
  const [language, setLanguage] = useState('en')

  const quickLinks = [
    { name: "Documentation", href: "/docs" },
    { name: "Contact Us", href: "/contact" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "FAQ", href: "/faq" },
    { name: "Support", href: "/support" },
  ]

  const socialLinks = [
    { name: "GitHub", icon: FiGithub, href: "https://github.com/studybuddy" },
    { name: "Twitter", icon: FiTwitter, href: "https://twitter.com/studybuddy" },
    { name: "LinkedIn", icon: FiLinkedin, href: "https://linkedin.com/company/studybuddy" },
    { name: "Instagram", icon: FiInstagram, href: "https://instagram.com/studybuddy" },
  ]

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">StudyBuddy</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Connecting students with peers who love to teach. Get help, share knowledge, and grow together.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Language Selector */}
          <div>
            <h3 className="text-white font-semibold mb-4">Language</h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-800 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
