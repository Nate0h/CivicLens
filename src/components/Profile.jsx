import React, { useState } from 'react'
import ElectionData from './profile/ElectionData'
import { clearAllAppData, getAllAppData } from '../utils/storageUtils'

function Profile() {
  const [activeTab, setActiveTab] = useState('elections')

  const tabs = [
    { id: 'elections', name: 'Elections', icon: 'ballot-box' },
    { id: 'settings', name: 'Settings', icon: 'cog' },
    { id: 'preferences', name: 'Preferences', icon: 'user' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'elections':
        return <ElectionData />
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        )
      case 'preferences':
        return (
          <div className="bg-white rounded-lg shadow px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Preferences</h2>
            <p className="text-gray-600">Preferences panel coming soon...</p>
          </div>
        )
      default:
        return <ElectionData />
    }
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This will reset your onboarding progress and you\'ll need to start over.')) {
      const clearedCount = clearAllAppData()
      alert(`Cleared ${clearedCount} stored items. Please refresh the page to start fresh.`)
      // Optionally redirect to home or reload
      window.location.href = '/'
    }
  }

  const handleViewData = () => {
    const data = getAllAppData()
    console.log('All stored app data:', data)
    alert('Check the browser console to see all stored data')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {tab.icon === 'ballot-box' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        )}
                        {tab.icon === 'cog' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        )}
                        {tab.icon === 'user' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        )}
                      </svg>
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
            
            {/* Debug Panel - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 bg-gray-100 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Tools</h3>
                <div className="space-x-4">
                  <button
                    onClick={handleViewData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Stored Data
                  </button>
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
        </div>
      </div>
    </div>
  )
}

export default Profile
