import React, { useState } from 'react'
import { getElectionDataByAddress } from '../services/ballotpediaResponsesApi'

const TestBallotpediaResponsesApi = () => {
  const [address, setAddress] = useState('123 Main St, Trenton, NJ 08608')
  const [year, setYear] = useState(2025)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [testHistory, setTestHistory] = useState([])

  // Predefined test addresses for different states with known elections
  const testAddresses = [
    { label: 'New Jersey (Governor 2025)', address: '123 Main St, Trenton, NJ 08608', year: 2025 },
    { label: 'Virginia (Governor 2025)', address: '456 Oak Ave, Richmond, VA 23219', year: 2025 },
    { label: 'Kentucky (Governor 2025)', address: '789 Elm St, Frankfort, KY 40601', year: 2025 },
    { label: 'Louisiana (Governor 2025)', address: '321 Pine St, Baton Rouge, LA 70801', year: 2025 },
    { label: 'Mississippi (Governor 2025)', address: '654 Cedar Ave, Jackson, MS 39201', year: 2025 },
    { label: 'Texas (Multiple Offices)', address: '987 Maple Dr, Austin, TX 78701', year: 2025 },
    { label: 'California (Multiple Offices)', address: '147 Palm St, Sacramento, CA 95814', year: 2025 },
    { label: 'New York (Multiple Offices)', address: '258 Broadway, Albany, NY 12207', year: 2025 }
  ]

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    const testStart = Date.now()
    
    try {
      console.log(`🧪 Testing ballotpediaResponsesApi with address: ${address}, year: ${year}`)
      
      const data = await getElectionDataByAddress(address, year)
      const testEnd = Date.now()
      const duration = testEnd - testStart

      setResults(data)
      
      // Add to test history
      const testResult = {
        timestamp: new Date().toISOString(),
        address,
        year,
        duration,
        success: true,
        electionsFound: data.elections.length,
        electionTypes: [...new Set(data.elections.map(e => e.type))],
        state: data.state
      }
      
      setTestHistory(prev => [testResult, ...prev.slice(0, 9)]) // Keep last 10 tests
      
    } catch (err) {
      console.error('❌ Test failed:', err)
      setError(err.message)
      
      const testEnd = Date.now()
      const duration = testEnd - testStart
      
      // Add failed test to history
      const testResult = {
        timestamp: new Date().toISOString(),
        address,
        year,
        duration,
        success: false,
        error: err.message
      }
      
      setTestHistory(prev => [testResult, ...prev.slice(0, 9)])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickTest = (testCase) => {
    setAddress(testCase.address)
    setYear(testCase.year)
  }

  const clearResults = () => {
    setResults(null)
    setError(null)
    setTestHistory([])
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Ballotpedia Responses API Tester
          </h1>
          <p className="text-gray-600">
            Test the enhanced API that searches for ALL state-level elections with strict date filtering
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter full address..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Election Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="2024"
                max="2028"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleTest}
              disabled={loading || !address.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                '🧪 Run Test'
              )}
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Test Cases:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {testAddresses.map((testCase, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickTest(testCase)}
                  className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  {testCase.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test History */}
        {testHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test History</h2>
            <div className="space-y-2">
              {testHistory.map((test, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  test.success ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{test.state || 'Unknown State'}</span>
                      <span className="text-gray-600 ml-2">({test.year})</span>
                      {test.success && (
                        <span className="ml-2 text-sm text-green-600">
                          {test.electionsFound} elections found
                          {test.electionTypes.length > 0 && ` (${test.electionTypes.join(', ')})`}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{new Date(test.timestamp).toLocaleTimeString()}</div>
                      <div>{test.duration}ms</div>
                    </div>
                  </div>
                  {!test.success && (
                    <div className="text-red-600 text-sm mt-1">{test.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Test Failed</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Test Results Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.elections.length}</div>
                  <div className="text-sm text-gray-600">Elections Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.state}</div>
                  <div className="text-sm text-gray-600">State</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {results.searchMetadata?.targetYear || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Target Year</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {results.metadata?.sources?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Sources</div>
                </div>
              </div>
            </div>

            {/* Elections List */}
            {results.elections.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">🗳️ Elections Found</h3>
                <div className="space-y-4">
                  {results.elections.map((election, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{election.name}</h4>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>📅 {election.electionDay}</span>
                            <span>🏛️ {election.office}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              election.type === 'federal' ? 'bg-blue-100 text-blue-700' :
                              election.type === 'statewide' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {election.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {election.candidates && election.candidates.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Candidates ({election.candidates.length}):</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {election.candidates.map((candidate, candidateIndex) => (
                              <div key={candidateIndex} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                                <div>
                                  <span className="font-medium">{candidate.name}</span>
                                  {candidate.incumbent && (
                                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                      Incumbent
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-600">{candidate.party}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ No Elections Found</h3>
                <p className="text-yellow-700">
                  No upcoming elections found for {results.state} in {results.searchMetadata?.targetYear}.
                  This could mean there are no elections scheduled, or they may have already occurred.
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📊 API Response Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Search Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Search Date:</strong> {results.searchMetadata?.searchDate}</div>
                    <div><strong>Target Year:</strong> {results.searchMetadata?.targetYear}</div>
                    <div><strong>Search Types:</strong> {results.searchMetadata?.searchTypes?.join(', ')}</div>
                    <div><strong>Method:</strong> {results.metadata?.method}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Filtering Results</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Fetched At:</strong> {new Date(results.metadata?.fetchedAt).toLocaleString()}</div>
                    <div><strong>Total Found:</strong> {results.metadata?.totalFound || 'N/A'}</div>
                    <div><strong>Valid Upcoming:</strong> {results.metadata?.validUpcoming || results.elections.length}</div>
                    <div><strong>Filtered Date:</strong> {results.metadata?.filteredDate}</div>
                  </div>
                </div>
              </div>
              
              {results.metadata?.sources && results.metadata.sources.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Sources ({results.metadata.sources.length})</h4>
                  <div className="space-y-1">
                    {results.metadata.sources.slice(0, 5).map((source, index) => (
                      <div key={index} className="text-sm">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source.title || source.url}
                        </a>
                      </div>
                    ))}
                    {results.metadata.sources.length > 5 && (
                      <div className="text-sm text-gray-500">
                        ... and {results.metadata.sources.length - 5} more sources
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestBallotpediaResponsesApi
