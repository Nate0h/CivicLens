import React, { useState, useEffect } from 'react'
import { getStateElectionData, formatAddressForAPI } from '../../services/googleCivicApi'

function ElectionData() {
  const [electionData, setElectionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedContests, setSelectedContests] = useState([])

  useEffect(() => {
    const loadElectionData = async () => {
      try {
        // Get basic info from onboarding (try session-based first, then fallback)
        const sessionId = sessionStorage.getItem('user_session_id')
        let basicInfo = null
        
        if (sessionId) {
          basicInfo = localStorage.getItem(`onboarding_basic_info_${sessionId}`)
        }
        
        // Fallback to non-session key for existing users
        if (!basicInfo) {
          basicInfo = localStorage.getItem('onboarding_basic_info')
        }
        
        if (!basicInfo) {
          setError('Address not found. Please update your address in your profile settings.')
          setLoading(false)
          return
        }

        const parsedBasicInfo = JSON.parse(basicInfo)
        
        // Handle both granular and legacy address formats
        let addressString = ''
        if (parsedBasicInfo.streetAddress) {
          // New granular format
          addressString = formatAddressForAPI(parsedBasicInfo)
        } else if (parsedBasicInfo.address) {
          // Legacy single address field
          addressString = parsedBasicInfo.address
        } else {
          setError('Address not found. Please update your address in your profile settings.')
          setLoading(false)
          return
        }

        // Fetch election data
        const data = await getStateElectionData(addressString)
        setElectionData(data)

        // Load saved contest selections
        const savedSelections = localStorage.getItem('profile_selected_contests')
        if (savedSelections) {
          setSelectedContests(JSON.parse(savedSelections))
        }

      } catch (err) {
        console.error('Error loading election data:', err)
        setError('Failed to load election data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadElectionData()
  }, [])

  // Save selected contests whenever they change
  useEffect(() => {
    if (selectedContests.length > 0) {
      localStorage.setItem('profile_selected_contests', JSON.stringify(selectedContests))
    }
  }, [selectedContests])

  const handleContestToggle = (contestIndex) => {
    setSelectedContests(prev => {
      if (prev.includes(contestIndex)) {
        return prev.filter(index => index !== contestIndex)
      } else {
        return [...prev, contestIndex]
      }
    })
  }

  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    // Trigger reload by re-running the effect
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow px-6 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading election data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow px-6 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Election Data</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={handleRefresh}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasContests = electionData?.contests && electionData.contests.length > 0
  const upcomingElections = electionData?.elections || []

  return (
    <div className="bg-white rounded-lg shadow px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Your State Elections</h1>
          </div>
          <button
            onClick={handleRefresh}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>
        <p className="text-gray-600">
          Based on your address, here are the upcoming state-level elections and candidates in your area.
        </p>
      </div>

      {/* Upcoming Elections Info */}
      {upcomingElections.length > 0 && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Upcoming Elections</h3>
          {upcomingElections.slice(0, 3).map((election, index) => (
            <div key={election.id} className="mb-2">
              <span className="font-medium text-blue-800">{election.name}</span>
              <span className="text-blue-600 ml-2">
                {new Date(election.electionDay).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* State Contests */}
      {hasContests ? (
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              State-Level Races & Ballot Measures
            </h3>
            <p className="text-sm text-gray-600">
              Track the races you're most interested in following.
            </p>
          </div>

          {electionData.contests.map((contest, index) => {
            const formattedContest = formatContest(contest)
            const isSelected = selectedContests.includes(index)
            
            return (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleContestToggle(index)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleContestToggle(index)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {formattedContest.office}
                    </h4>
                    
                    {formattedContest.district && (
                      <p className="text-sm text-gray-600 mb-2">
                        District: {formattedContest.district.name}
                      </p>
                    )}

                    {/* Candidates */}
                    {formattedContest.candidates.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Candidates:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {formattedContest.candidates.map((candidate, candidateIndex) => (
                            <div key={candidateIndex} className="text-sm text-gray-600">
                              <span className="font-medium">{candidate.name}</span>
                              {candidate.party && (
                                <span className="text-gray-500"> ({candidate.party})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ballot Measure Text */}
                    {formattedContest.referendumTitle && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          {formattedContest.referendumTitle}
                        </p>
                        {formattedContest.referendumText && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                            {formattedContest.referendumText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No State Elections Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are currently no upcoming state-level elections in your area.
          </p>
        </div>
      )}
    </div>
  )
}

export default ElectionData
