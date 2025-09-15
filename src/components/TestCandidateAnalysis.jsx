import React, { useState } from 'react'
import { getCandidateAnalysis, getUserSurveyData, validateUserDataForAnalysis } from '../services/candidateAnalysisApi'

function TestCandidateAnalysis() {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testMode, setTestMode] = useState('mock') // 'mock' or 'real'

  // Mock election data for testing
  const mockElectionData = {
    id: 'test_election_2025',
    name: '2025 New Jersey Governor Election',
    electionDay: '2025-11-04',
    office: 'Governor',
    candidates: [
      {
        name: 'Josh Gottheimer',
        party: 'Democratic',
        office: 'Governor'
      },
      {
        name: 'Jack Ciattarelli',
        party: 'Republican',
        office: 'Governor'
      },
      {
        name: 'Mikie Sherrill',
        party: 'Democratic',
        office: 'Governor'
      }
    ]
  }

  // Mock user survey data for testing
  const mockUserSurveyData = {
    priorityTopics: ['healthcare', 'economy-jobs', 'climate-environment'],
    surveyResponses: {
      // Healthcare responses (strongly supports government healthcare)
      'healthcare_0': 5, // Government should provide universal healthcare coverage
      'healthcare_1': 2, // Private healthcare insurance should be primary (disagree)
      'healthcare_2': 5, // Healthcare costs should be regulated by government
      
      // Economy & Jobs responses (moderate progressive stance)
      'economy-jobs_0': 3, // Cutting taxes for businesses creates jobs (neutral)
      'economy-jobs_1': 4, // Government should regulate large corporations more (agree)
      'economy-jobs_2': 5, // Minimum wage should be raised (strongly agree)
      
      // Climate & Environment responses (strongly pro-environment)
      'climate-environment_0': 5, // Government should invest in renewable energy
      'climate-environment_1': 1, // Environmental regulations should be reduced (strongly disagree)
      'climate-environment_2': 5, // Climate change is urgent issue (strongly agree)
    },
    sessionId: 'test_session_123'
  }

  const testWithMockData = async () => {
    setLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      console.log('🧪 Testing with mock data...')
      const result = await getCandidateAnalysis(mockElectionData, mockUserSurveyData)
      setAnalysisResult(result)
      console.log('✅ Mock test completed successfully:', result)
    } catch (err) {
      setError(err.message)
      console.error('❌ Mock test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const testWithRealData = async () => {
    setLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      console.log('🧪 Testing with real user data...')
      
      // Get real user data from localStorage
      const sessionId = sessionStorage.getItem('user_session_id')
      if (!sessionId) {
        throw new Error('No user session found. Please complete onboarding first.')
      }

      const realUserData = getUserSurveyData(sessionId)
      console.log('📋 Real user data:', realUserData)

      // Validate user data
      if (!validateUserDataForAnalysis(realUserData)) {
        throw new Error('User has not completed sufficient survey data for analysis. Please complete the onboarding survey.')
      }

      // Use mock election data with real user data
      const result = await getCandidateAnalysis(mockElectionData, realUserData)
      setAnalysisResult(result)
      console.log('✅ Real data test completed successfully:', result)
    } catch (err) {
      setError(err.message)
      console.error('❌ Real data test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const testValidation = () => {
    console.log('🧪 Testing validation functions...')
    
    // Test with valid data
    const validResult = validateUserDataForAnalysis(mockUserSurveyData)
    console.log('✅ Valid data test:', validResult) // Should be true
    
    // Test with invalid data (no priority topics)
    const invalidData1 = { priorityTopics: [], surveyResponses: {} }
    const invalidResult1 = validateUserDataForAnalysis(invalidData1)
    console.log('❌ Invalid data test 1 (no topics):', invalidResult1) // Should be false
    
    // Test with invalid data (no responses)
    const invalidData2 = { priorityTopics: ['healthcare'], surveyResponses: {} }
    const invalidResult2 = validateUserDataForAnalysis(invalidData2)
    console.log('❌ Invalid data test 2 (no responses):', invalidResult2) // Should be false
    
    alert('Validation tests completed. Check console for results.')
  }

  const clearResults = () => {
    setAnalysisResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Candidate Analysis Service Test
          </h1>
          
          {/* Test Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testWithMockData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
              >
                {loading && testMode === 'mock' ? 'Testing...' : 'Test with Mock Data'}
              </button>
              
              <button
                onClick={testWithRealData}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
              >
                {loading && testMode === 'real' ? 'Testing...' : 'Test with Real User Data'}
              </button>
              
              <button
                onClick={testValidation}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
              >
                Test Validation Functions
              </button>
              
              <button
                onClick={clearResults}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Mock Data Display */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Mock Test Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">Election Data</h3>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(mockElectionData, null, 2)}
                </pre>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">User Survey Data</h3>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(mockUserSurveyData, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mb-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Running analysis... This may take 30-60 seconds.</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium mb-2">❌ Test Failed</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {analysisResult && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">📊 Analysis Results</h2>
              
              {/* Overall Assessment */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                <h3 className="text-indigo-800 font-medium mb-2">Overall Assessment</h3>
                <p className="text-indigo-700">{analysisResult.overallAssessment}</p>
              </div>

              {/* Topic Analysis */}
              {analysisResult.topicAnalysis && analysisResult.topicAnalysis.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Topic-by-Topic Analysis</h3>
                  <div className="space-y-4">
                    {analysisResult.topicAnalysis.map((topic, index) => (
                      <div key={index} className="bg-gray-50 border rounded-md p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{topic.topicTitle}</h4>
                        <div className="grid gap-3">
                          {topic.candidates.map((candidate, candidateIndex) => (
                            <div 
                              key={candidateIndex}
                              className={`p-3 rounded-md border ${
                                candidate.alignment === 'strong' ? 'bg-green-50 border-green-200' :
                                candidate.alignment === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
                                candidate.alignment === 'weak' ? 'bg-orange-50 border-orange-200' :
                                'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {candidate.name} ({candidate.party})
                                </h5>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  candidate.alignment === 'strong' ? 'bg-green-100 text-green-800' :
                                  candidate.alignment === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  candidate.alignment === 'weak' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {candidate.alignment}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{candidate.stance}</p>
                              <p className="text-xs text-gray-600">{candidate.alignmentReason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {analysisResult.metadata && (
                <div className="bg-gray-50 border rounded-md p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Analysis Metadata</h3>
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(analysisResult.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestCandidateAnalysis
