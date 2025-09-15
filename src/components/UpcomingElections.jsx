import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getElectionDataByAddress } from '../services/ballotpediaResponsesApi'
import { getUserSurveyData, validateUserDataForAnalysis } from '../services/candidateAnalysisApi'

function UpcomingElections() {
  const navigate = useNavigate()
  const [electionData, setElectionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userAddress, setUserAddress] = useState('')

  // Get user address from localStorage on component mount
  useEffect(() => {
    const getUserAddress = () => {
      // Try to get address from onboarding data first
      const sessionId = sessionStorage.getItem('user_session_id')
      if (sessionId) {
        const basicInfoData = localStorage.getItem(`onboarding_basic_info_${sessionId}`)
        if (basicInfoData) {
          try {
            const parsedData = JSON.parse(basicInfoData)
            const { streetAddress, city, state, zipCode } = parsedData
            if (streetAddress && city && state && zipCode) {
              return `${streetAddress}, ${city}, ${state} ${zipCode}`
            }
          } catch (error) {
            console.error('Error parsing basic info data:', error)
          }
        }
      }

      // Fallback to profile data if available
      const profileAddress = localStorage.getItem('profile_address')
      if (profileAddress) {
        return profileAddress
      }

      return null
    }

    const address = getUserAddress()
    if (address) {
      setUserAddress(address)
      fetchElectionData(address)
    }
  }, [])

  const fetchElectionData = async (address) => {
    if (!address) {
      setError('No address found. Please complete your profile information.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching election data for address:', address)
      const data = await getElectionDataByAddress(address, 2025)
      setElectionData(data)
    } catch (err) {
      console.error('Failed to fetch election data:', err)
      setError(err.message || 'Failed to fetch election data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (userAddress) {
      fetchElectionData(userAddress)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const getPartyColor = (party) => {
    if (!party) return 'bg-gray-100 text-gray-800'
    
    const partyLower = party.toLowerCase()
    if (partyLower.includes('democrat') || partyLower.includes('democratic')) {
      return 'bg-blue-100 text-blue-800'
    } else if (partyLower.includes('republican')) {
      return 'bg-red-100 text-red-800'
    } else if (partyLower.includes('independent')) {
      return 'bg-purple-100 text-purple-800'
    } else if (partyLower.includes('green')) {
      return 'bg-green-100 text-green-800'
    } else if (partyLower.includes('libertarian')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const handleGetAnalysis = (election) => {
    // Check if user has completed survey data
    const sessionId = sessionStorage.getItem('user_session_id')
    if (!sessionId) {
      alert('Please complete the onboarding process first to get personalized analysis.')
      return
    }

    const userSurveyData = getUserSurveyData(sessionId)
    if (!validateUserDataForAnalysis(userSurveyData)) {
      alert('Please complete the opinion survey in your onboarding to get personalized candidate analysis.')
      return
    }

    // Navigate to analysis page with election data
    navigate(`/analysis/${election.id}`, {
      state: { electionData: election }
    })
  }

  if (!userAddress) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Address Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please complete your profile with your address to see upcoming elections in your area.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Elections</h2>
            <p className="mt-1 text-sm text-gray-600">
              Elections in your area based on: {userAddress}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`-ml-1 mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Fetching election data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Elections</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Election Data */}
      {electionData && electionData.elections && (
        <div className="space-y-4">
          {electionData.elections.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Upcoming Elections</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no upcoming elections found for your area at this time.
                </p>
              </div>
            </div>
          ) : (
            electionData.elections.map((election) => (
              <div key={election.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{election.name}</h3>
                      <p className="text-sm text-gray-600">{election.office}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(election.electionDay)}
                        </p>
                        <p className="text-xs text-gray-500">Election Day</p>
                      </div>
                      <button
                        onClick={() => handleGetAnalysis(election)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        📊 Get Analysis
                      </button>
                    </div>
                  </div>
                </div>

                {election.candidates && election.candidates.length > 0 && (
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Candidates</h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {election.candidates.map((candidate, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">{candidate.name}</h5>
                              <p className="text-xs text-gray-600 mt-1">{candidate.office}</p>
                            </div>
                          </div>
                          {candidate.party && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPartyColor(candidate.party)}`}>
                                {candidate.party}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Metadata */}
      {electionData && electionData.metadata && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500">
            Data fetched on {new Date(electionData.metadata.fetchedAt).toLocaleString()} 
            {electionData.metadata.sources && electionData.metadata.sources.length > 0 && (
              <span> from {electionData.metadata.sources.length} source(s)</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default UpcomingElections
