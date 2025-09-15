import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getCandidateAnalysis, getUserSurveyData, validateUserDataForAnalysis, saveAnalysisToHistory } from '../services/candidateAnalysisApi'

function CandidateAnalysis() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [electionData, setElectionData] = useState(null)

  useEffect(() => {
    const initializeAnalysis = async () => {
      try {
        // Get election data from navigation state or localStorage
        let currentElectionData = location.state?.electionData
        
        if (!currentElectionData && electionId) {
          // Try to get from localStorage as fallback
          const storedElections = localStorage.getItem('cached_election_data')
          if (storedElections) {
            const elections = JSON.parse(storedElections)
            currentElectionData = elections.find(e => e.id === electionId)
          }
        }

        if (!currentElectionData) {
          throw new Error('Election data not found. Please return to elections and try again.')
        }

        setElectionData(currentElectionData)

        // Get user survey data
        const sessionId = sessionStorage.getItem('user_session_id')
        if (!sessionId) {
          throw new Error('No user session found. Please complete onboarding first.')
        }

        const userSurveyData = getUserSurveyData(sessionId)
        
        // Validate user data
        if (!validateUserDataForAnalysis(userSurveyData)) {
          throw new Error('Insufficient survey data. Please complete the onboarding survey first.')
        }

        // Run the analysis
        const analysis = await getCandidateAnalysis(currentElectionData, userSurveyData)
        setAnalysisData(analysis)

        // Save to history
        saveAnalysisToHistory(currentElectionData, analysis, sessionId)

      } catch (err) {
        setError(err.message)
        console.error('Analysis initialization failed:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAnalysis()
  }, [electionId, location.state])

  const handleRefresh = async () => {
    if (!electionData) return
    
    setLoading(true)
    setError(null)
    
    try {
      const sessionId = sessionStorage.getItem('user_session_id')
      const userSurveyData = getUserSurveyData(sessionId)
      const analysis = await getCandidateAnalysis(electionData, userSurveyData)
      setAnalysisData(analysis)

      // Save updated analysis to history
      saveAnalysisToHistory(electionData, analysis, sessionId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getAlignmentColor = (alignment) => {
    switch (alignment) {
      case 'strong':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'weak':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'opposed':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getAlignmentIcon = (alignment) => {
    switch (alignment) {
      case 'strong':
        return '📈'
      case 'moderate':
        return '➖'
      case 'weak':
        return '📉'
      case 'opposed':
        return '❌'
      default:
        return '❓'
    }
  }

  const getAlignmentBadgeColor = (alignment) => {
    switch (alignment) {
      case 'strong':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'weak':
        return 'bg-orange-100 text-orange-800'
      case 'opposed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Analyzing candidates...</p>
          <p className="text-gray-500 text-sm mt-2">This may take 30-60 seconds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Analysis Error</h1>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <h3 className="text-red-800 font-medium">Unable to Complete Analysis</h3>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={handleRefresh}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                ← Back
              </button>
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">👤</span>
                  <h1 className="text-2xl font-bold text-gray-900">Personalized Impact Comparison</h1>
                </div>
                <p className="text-gray-600">
                  {electionData?.name || 'Election Analysis'} • {electionData?.electionDay || 'Election Date'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-md font-medium"
            >
              <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>🔄</span>
              Refresh Analysis
            </button>
          </div>
        </div>

        {/* Overall Assessment */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">📊</span>
            <h2 className="text-xl font-bold text-indigo-900">Overall Assessment</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {analysisData?.overallAssessment || 'Analysis not available.'}
          </p>
        </div>

        {/* Topic Analysis */}
        {analysisData?.topicAnalysis && analysisData.topicAnalysis.length > 0 && (
          <div className="space-y-6">
            {analysisData.topicAnalysis.map((topic, topicIndex) => (
              <div key={topicIndex} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {topic.topicTitle}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {topic.candidates.map((candidate, candidateIndex) => (
                    <div
                      key={candidateIndex}
                      className={`p-4 rounded-lg border-2 ${getAlignmentColor(candidate.alignment)}`}
                    >
                      {/* Candidate Header */}
                      <div className="text-center mb-3">
                        <div className="text-2xl mb-2">
                          {getAlignmentIcon(candidate.alignment)}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {candidate.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {candidate.party}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getAlignmentBadgeColor(candidate.alignment)}`}>
                          {candidate.alignment}
                        </span>
                      </div>
                      
                      {/* Candidate Stance */}
                      <div className="text-xs text-gray-700 leading-relaxed">
                        <p className="mb-2">{candidate.stance}</p>
                        {candidate.alignmentReason && (
                          <p className="text-gray-600 italic">
                            {candidate.alignmentReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis Metadata */}
        {analysisData?.metadata && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">
              Analysis completed on {new Date(analysisData.metadata.fetchedAt).toLocaleString()}
              {analysisData.metadata.sources && analysisData.metadata.sources.length > 0 && (
                <span className="ml-2">
                  • Sources: {analysisData.metadata.sources.length} references
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateAnalysis
