import React, { useState, useEffect } from 'react'
import { getCandidateAnalysis, getUserSurveyData } from '../services/candidateAnalysisApi'

function AnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalysisHistory()
  }, [])

  const loadAnalysisHistory = () => {
    try {
      const sessionId = sessionStorage.getItem('user_session_id')
      if (!sessionId) return

      const historyData = localStorage.getItem(`analysis_history_${sessionId}`)
      if (historyData) {
        const history = JSON.parse(historyData)
        setAnalysisHistory(history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
        
        // Auto-select the most recent analysis if available
        if (history.length > 0 && !selectedAnalysis) {
          setSelectedAnalysis(history[0])
        }
      }
    } catch (error) {
      console.error('Error loading analysis history:', error)
    }
  }

  const rerunAnalysis = async (historyItem) => {
    setLoading(true)
    setError(null)

    try {
      const sessionId = sessionStorage.getItem('user_session_id')
      const userSurveyData = getUserSurveyData(sessionId)
      
      const newAnalysis = await getCandidateAnalysis(historyItem.electionData, userSurveyData)
      
      // Update the analysis in history
      const updatedAnalysis = {
        ...historyItem,
        analysisData: newAnalysis,
        timestamp: new Date().toISOString()
      }

      // Update localStorage
      const updatedHistory = analysisHistory.map(item => 
        item.id === historyItem.id ? updatedAnalysis : item
      )
      
      const sessionIdForStorage = sessionStorage.getItem('user_session_id')
      localStorage.setItem(`analysis_history_${sessionIdForStorage}`, JSON.stringify(updatedHistory))
      
      setAnalysisHistory(updatedHistory)
      setSelectedAnalysis(updatedAnalysis)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteAnalysis = (analysisId) => {
    const updatedHistory = analysisHistory.filter(item => item.id !== analysisId)
    
    const sessionId = sessionStorage.getItem('user_session_id')
    localStorage.setItem(`analysis_history_${sessionId}`, JSON.stringify(updatedHistory))
    
    setAnalysisHistory(updatedHistory)
    
    // If we deleted the selected analysis, select the next most recent one
    if (selectedAnalysis?.id === analysisId) {
      setSelectedAnalysis(updatedHistory.length > 0 ? updatedHistory[0] : null)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
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

  if (analysisHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Analysis History</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't run any candidate analyses yet. Go to the "Upcoming Elections" tab and click "Get Analysis" on an election to get started.
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
            <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
            <p className="mt-1 text-sm text-gray-600">
              View and manage your previous candidate analyses
            </p>
          </div>
          <button
            onClick={loadAnalysisHistory}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Previous Analyses</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analysisHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedAnalysis?.id === item.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedAnalysis(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.electionData.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(item.timestamp)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.electionData.candidates?.length || 0} candidates analyzed
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          rerunAnalysis(item)
                        }}
                        disabled={loading}
                        className="text-indigo-600 hover:text-indigo-800 text-xs"
                        title="Rerun Analysis"
                      >
                        🔄
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAnalysis(item.id)
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Delete Analysis"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Display */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Updating analysis...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <h3 className="text-red-800 font-medium">Analysis Error</h3>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            </div>
          )}

          {selectedAnalysis && !loading && !error && (
            <div className="space-y-6">
              {/* Election Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedAnalysis.electionData.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedAnalysis.electionData.office} • {selectedAnalysis.electionData.electionDay}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Analysis Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(selectedAnalysis.timestamp)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Assessment */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">📊</span>
                  <h3 className="text-xl font-bold text-indigo-900">Overall Assessment</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {selectedAnalysis.analysisData?.overallAssessment || 'Analysis not available.'}
                </p>
              </div>

              {/* Topic Analysis */}
              {selectedAnalysis.analysisData?.topicAnalysis && selectedAnalysis.analysisData.topicAnalysis.length > 0 && (
                <div className="space-y-6">
                  {selectedAnalysis.analysisData.topicAnalysis.map((topic, topicIndex) => (
                    <div key={topicIndex} className="bg-white rounded-lg shadow p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {topic.topicTitle}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <h5 className="font-semibold text-gray-900 text-sm">
                                {candidate.name}
                              </h5>
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
              {selectedAnalysis.analysisData?.metadata && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    Analysis completed on {new Date(selectedAnalysis.analysisData.metadata.fetchedAt).toLocaleString()}
                    {selectedAnalysis.analysisData.metadata.sources && selectedAnalysis.analysisData.metadata.sources.length > 0 && (
                      <span className="ml-2">
                        • Sources: {selectedAnalysis.analysisData.metadata.sources.length} references
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedAnalysis && !loading && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <span className="text-2xl">👈</span>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select an Analysis</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose an analysis from the list to view the results.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalysisHistory
