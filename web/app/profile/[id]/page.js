'use client'
import { useEffect, useState } from 'react';
import { use } from 'react'; // For Next.js 13+
import { profileService } from '@/src/services/profileService';
import formatDate from '@/src/utils/formatDate';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function PublicProfilePage({ params }) {
  const { id } = use(params); // Get ID from URL parameters
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const userProfile = await profileService.getPublicUserProfile(id);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          setError('User not found.');
        }
      } catch (e) {
        console.error('Error fetching public user profile:', e);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen py-12 px-4 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="min-h-screen py-12 px-4 text-center text-red-600">❌ {error}</div>;
  }

  if (!profile) {
    return <div className="min-h-screen py-12 px-4 text-center text-gray-600">Profile not available.</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden my-12">
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg absolute -bottom-12"
          />
        ) : (
          <UserCircleIcon className="w-24 h-24 text-white absolute -bottom-12" />
        )}
      </div>
      <div className="pt-16 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
        <p className="text-gray-600 text-sm">{profile.email}</p>
        {profile.joinDate && (
          <p className="text-gray-500 text-xs mt-1">Joined: {formatDate(profile.joinDate?.toDate())}</p>
        )}
        {/* You can add more public profile details here */}
      </div>
    </div>
  );
} 