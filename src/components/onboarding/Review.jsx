import React from 'react'
import { useNavigate } from 'react-router-dom'
import StepTracker from '../StepTracker'

function Review() {
  const navigate = useNavigate()

  const handleComplete = () => {
    // Mark onboarding as complete and redirect to profile
    const sessionId = sessionStorage.getItem('user_session_id')
    if (sessionId) {
      localStorage.setItem(`onboarding_completed_${sessionId}`, 'true')
    }
    navigate('/profile')
  }

  const handleBack = () => {
    navigate('/onboarding/opinion-survey')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StepTracker currentStep={4} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Review</h1>
            <p className="mt-2 text-gray-600">This section will be detailed soon.</p>
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={handleBack}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Review
