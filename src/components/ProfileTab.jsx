import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ElectionData from './profile/ElectionData'
import { clearAllAppData, getAllAppData } from '../utils/storageUtils'

function ProfileTab() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('personal')
  const [profileData, setProfileData] = useState(null)

  // Load user profile data from onboarding
  useEffect(() => {
    const sessionId = sessionStorage.getItem('user_session_id')
    if (sessionId) {
      const basicInfoData = localStorage.getItem(`onboarding_basic_info_${sessionId}`)
      const priorityIssuesData = localStorage.getItem(`onboarding_priority_issues_${sessionId}`)
      
      if (basicInfoData) {
        try {
          const basicInfo = JSON.parse(basicInfoData)
          const priorityIssues = priorityIssuesData ? JSON.parse(priorityIssuesData) : []
          
          setProfileData({
            ...basicInfo,
            selectedIssues: priorityIssues
          })
        } catch (error) {
          console.error('Error loading profile data:', error)
        }
      }
    }
  }, [])

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: 'user' },
    { id: 'elections', name: 'Election Data', icon: 'vote' },
    { id: 'settings', name: 'Settings', icon: 'cog' }
  ]

  const renderSectionIcon = (iconType) => {
    switch (iconType) {
      case 'user':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'vote':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      case 'cog':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        )
      default:
        return null
    }
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This will reset your onboarding progress and you\'ll need to start over.')) {
      const clearedCount = clearAllAppData()
      alert(`Cleared ${clearedCount} stored items. Please refresh the page to start fresh.`)
      window.location.href = '/'
    }
  }

  const handleViewData = () => {
    const data = getAllAppData()
    console.log('All stored app data:', data)
    alert('Check the browser console to see all stored data')
  }

  const formatAddress = (data) => {
    if (!data) return 'Not provided'
    const { streetAddress, city, state, zipCode } = data
    if (streetAddress && city && state && zipCode) {
      return `${streetAddress}, ${city}, ${state} ${zipCode}`
    }
    return 'Incomplete address'
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      {profileData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <p className="mt-1 text-sm text-gray-900">{profileData.currentOccupation || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Annual Income</label>
              <p className="mt-1 text-sm text-gray-900">{profileData.annualIncome || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age Group</label>
              <p className="mt-1 text-sm text-gray-900">{profileData.ageGroup || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Education Level</label>
              <p className="mt-1 text-sm text-gray-900">{profileData.educationLevel || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Housing Status</label>
              <p className="mt-1 text-sm text-gray-900">{profileData.housingStatus || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Family Status</label>
              <p className="mt-1 text-sm text-gray-900">{profileData.familyStatus || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-sm text-gray-900">{formatAddress(profileData)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Priority Issues */}
      {profileData?.selectedIssues && profileData.selectedIssues.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Issues</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.selectedIssues.map((issue, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {issue}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderElectionData = () => <ElectionData />

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
        <p className="text-gray-600 mb-4">Account settings panel coming soon...</p>
      </div>

      {/* Debug Panel - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Tools</h3>
          <div className="space-x-4">
            <button
              onClick={handleViewData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              View Stored Data
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Clear All Data
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            These tools are only visible in development mode.
          </p>
        </div>
      )}
    </div>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo()
      case 'elections':
        return renderElectionData()
      case 'settings':
        return renderSettings()
      default:
        return renderPersonalInfo()
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`${
                  activeSection === section.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                {renderSectionIcon(section.icon)}
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Section Content */}
      {renderSectionContent()}
    </div>
  )
}

export default ProfileTab
