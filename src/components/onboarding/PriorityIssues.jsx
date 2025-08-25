import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepTracker from '../StepTracker'

function PriorityIssues() {
  const navigate = useNavigate()
  const [selectedIssues, setSelectedIssues] = useState([])

  // Load saved selections on component mount
  useEffect(() => {
    const savedSelections = localStorage.getItem('onboarding_priority_issues')
    if (savedSelections) {
      try {
        const parsedSelections = JSON.parse(savedSelections)
        setSelectedIssues(parsedSelections)
      } catch (error) {
        console.error('Error loading saved priority issues:', error)
      }
    }
  }, [])

  // Save selections whenever they change
  useEffect(() => {
    if (selectedIssues.length > 0) {
      localStorage.setItem('onboarding_priority_issues', JSON.stringify(selectedIssues))
    }
  }, [selectedIssues])

  const issues = [
    {
      id: 'healthcare',
      title: 'Healthcare',
      description: 'Medicare, Medicaid, healthcare costs'
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Public education, student loans, school choice'
    },
    {
      id: 'economy-jobs',
      title: 'Economy & Jobs',
      description: 'Employment, wages, economic growth'
    },
    {
      id: 'taxes',
      title: 'Taxes',
      description: 'Tax rates, tax policy, government spending'
    },
    {
      id: 'climate-environment',
      title: 'Climate & Environment',
      description: 'Climate change, environmental protection'
    },
    {
      id: 'immigration',
      title: 'Immigration',
      description: 'Border security, immigration reform'
    },
    {
      id: 'criminal-justice',
      title: 'Criminal Justice',
      description: 'Law enforcement, prison reform, crime'
    },
    {
      id: 'foreign-policy',
      title: 'Foreign Policy',
      description: 'International relations, defense'
    },
    {
      id: 'social-security',
      title: 'Social Security',
      description: 'Retirement benefits, disability'
    },
    {
      id: 'housing',
      title: 'Housing',
      description: 'Housing costs, homeownership, rent control'
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      description: 'Roads, bridges, broadband, utilities'
    },
    {
      id: 'civil-rights',
      title: 'Civil Rights',
      description: 'Voting rights, equality, discrimination'
    },
    {
      id: 'gun-policy',
      title: 'Gun Policy',
      description: 'Gun control, second amendment rights'
    },
    {
      id: 'technology-privacy',
      title: 'Technology & Privacy',
      description: 'Data privacy, tech regulation'
    }
  ]

  const handleIssueToggle = (issueId) => {
    setSelectedIssues(prev => {
      if (prev.includes(issueId)) {
        return prev.filter(id => id !== issueId)
      } else if (prev.length < 7) {
        return [...prev, issueId]
      }
      return prev
    })
  }

  const handleContinue = () => {
    if (selectedIssues.length >= 3) {
      // TODO: Save selected issues
      console.log('Selected issues:', selectedIssues)
      navigate('/onboarding/opinion-survey')
    }
  }

  const handleBack = () => {
    navigate('/onboarding/basic-info')
  }

  const canContinue = selectedIssues.length >= 3
  const isMaxSelected = selectedIssues.length >= 7

  return (
    <div className="min-h-screen bg-gray-50">
      <StepTracker currentStep={2} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Priority Issues</h1>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">What issues matter most to you?</h2>
              <p className="text-gray-600 mb-4">
                Select the political issues that are most important to you. We'll use this to show how candidates' positions align with your priorities.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Selected: {selectedIssues.length} issues</span>
                  <br />
                  We recommend selecting 3-7 issues that are most important to you for the best personalized analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {issues.map((issue) => {
              const isSelected = selectedIssues.includes(issue.id)
              const isDisabled = !isSelected && isMaxSelected
              
              return (
                <div
                  key={issue.id}
                  className={`
                    relative border rounded-lg p-4 transition-all duration-200
                    ${isSelected 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleIssueToggle(issue.id)}
                      disabled={isDisabled}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                    />
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        isSelected ? 'text-indigo-900' : isDisabled ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {issue.title}
                      </h3>
                      <p className={`text-sm ${
                        isSelected ? 'text-indigo-700' : isDisabled ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {issue.description}
                      </p>
                    </div>
                  </label>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={handleBack}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                canContinue
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Opinion Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriorityIssues
