// src/features/profile/ProfileView.js
'use client'
import { useAuth } from '@/src/context/authContext'
import { useProfileLogic } from '@/src/hooks/useProfileLogic'
import UserBanner from './components/UserBanner'
import AboutSection from './components/AboutSection'
import StatsGrid from './components/StatsGrid'
import RecentActivity from './components/RecentActivity'
import ProfileTabs from './components/ProfileTabs'
import AccountSettings from './components/AccountSettings'
import SocialLinks from './components/SocialLinks'
import Badge from '@/src/components/common/Badge'

export default function ProfileView({ userId: propUserId }) {
  const { user } = useAuth()
  
  const {
    // State
    profile,
    myQuestions,
    myAnswers,
    savedQuestions,
    stats,
    editingName,
    editName,
    savingName,
    editingAbout,
    editAbout,
    savingAbout,
    editingSocial,
    editGithub,
    editLinkedin,
    savingSocial,
    saveMsg,
    isOwner,
    recentActivity,
    avatarUploading,
    handleAvatarChange,
    avatarDeleting,
    handleAvatarDelete,

    // Setters
    setEditingName,
    setEditName,
    setEditingAbout,
    setEditAbout,
    setEditingSocial,
    setEditGithub,
    setEditLinkedin,

    // Handlers
    handleUnsave,
    handleSaveName,
    handleSaveAbout,
    handleSaveSocial,
    logout,
    router
  } = useProfileLogic(user, propUserId)

  if (!user || !profile) return <p>Loading...</p>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* User Banner */}
      <UserBanner
        profile={profile}
        isOwner={isOwner}
        editingName={editingName}
        editName={editName}
        savingName={savingName}
        onEditName={() => setEditingName(true)}
        onSaveName={handleSaveName}
        onCancelEdit={() => {
          setEditingName(false)
          setEditName(profile.name || '')
        }}
        onNameChange={(e) => setEditName(e.target.value)}
        onAvatarChange={handleAvatarChange}
        avatarUploading={avatarUploading}
        onAvatarDelete={handleAvatarDelete}
        avatarDeleting={avatarDeleting}
      />

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {stats.badges && stats.badges.map(badgeKey => (
          <Badge key={badgeKey} badgeKey={badgeKey} />
        ))}
      </div>

      {/* About Section */}
      <AboutSection
        profile={profile}
        isOwner={isOwner}
        editingAbout={editingAbout}
        editAbout={editAbout}
        savingAbout={savingAbout}
        saveMsg={saveMsg}
        onEditAbout={() => setEditingAbout(true)}
        onSaveAbout={handleSaveAbout}
        onCancelEdit={() => {
          setEditingAbout(false)
          setEditAbout(profile.about || '')
        }}
        onAboutChange={(e) => setEditAbout(e.target.value)}
      />

      {/* Main Content */}
      <div className="mt-8">
        {/* Stats Overview */}
        <StatsGrid stats={stats} />

        {/* Recent Activity Feed */}
        <RecentActivity recentActivity={recentActivity} />

        {/* Tabs */}
        <ProfileTabs
          myQuestions={myQuestions}
          myAnswers={myAnswers}
          savedQuestions={savedQuestions}
          onQuestionClick={(q) => router.push(`/requests/${q.id}`)}
          onAnswerClick={(a) => router.push(`/requests/${a.requestId}`)}
          onSavedQuestionClick={(q) => router.push(`/requests/${q.id}`)}
        />

        {/* Account Management */}
        <AccountSettings onLogout={logout} />

        {/* Social Links Section */}
        <SocialLinks
          profile={profile}
          isOwner={isOwner}
          editingSocial={editingSocial}
          editGithub={editGithub}
          editLinkedin={editLinkedin}
          savingSocial={savingSocial}
          saveMsg={saveMsg}
          onEditSocial={() => setEditingSocial(true)}
          onSaveSocial={handleSaveSocial}
          onCancelEdit={() => {
            setEditingSocial(false)
            setEditGithub(profile.github || '')
            setEditLinkedin(profile.linkedin || '')
          }}
          onGithubChange={(e) => setEditGithub(e.target.value)}
          onLinkedinChange={(e) => setEditLinkedin(e.target.value)}
        />
      </div>
    </div>
  )
}
