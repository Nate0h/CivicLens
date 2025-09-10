import React, { useState } from 'react'
import { getElectionDataByAddress } from '../services/ballotpediaResponsesApi'

const TestResponsesAPI = () => {
  const [address, setAddress] = useState('')
  const [year, setYear] = useState(2025)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleTest = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log('🧪 Testing OpenAI Responses API with address:', address)
      const data = await getElectionDataByAddress(address, year)
      setResults(data)
      console.log('✅ Test completed successfully:', data)
    } catch (err) {
      console.error('❌ Test failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setResults(null)
    setError(null)
    setAddress('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            OpenAI Responses API Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the OpenAI Responses API with web search to retrieve gubernatorial election data from Ballotpedia.
          </p>

          {/* Input Form */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (with state)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main St, Trenton, NJ 08608"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  min="2024"
                  max="2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading ? 'Testing...' : 'Test API'}
              </button>
              
              <button
                onClick={handleClear}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-blue-800 font-medium">Processing Request...</p>
                  <p className="text-blue-600 text-sm">
                    This may take 30-60 seconds as OpenAI searches Ballotpedia and processes the data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-medium mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium mb-2">✅ Success!</h3>
                <p className="text-green-700">
                  Found {results.elections?.length || 0} election(s) for {results.state}
                </p>
              </div>

              {/* Elections */}
              {results.elections?.map((election, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{election.name}</h3>
                      <p className="text-gray-600">Office: {election.office}</p>
                      <p className="text-gray-600">Election Date: {election.electionDay}</p>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {election.candidates?.length || 0} candidates
                    </span>
                  </div>

                  {/* Candidates */}
                  {election.candidates && election.candidates.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Candidates:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {election.candidates.map((candidate, candidateIndex) => (
                          <div key={candidateIndex} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{candidate.name}</p>
                                <p className="text-gray-600">{candidate.party}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No candidates found</p>
                  )}
                </div>
              ))}

              {/* Metadata */}
              {results.metadata && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Request Metadata</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Method:</strong> {results.metadata.method}</p>
                    <p><strong>Fetched At:</strong> {new Date(results.metadata.fetchedAt).toLocaleString()}</p>
                    {results.metadata.responseId && (
                      <p><strong>Response ID:</strong> {results.metadata.responseId}</p>
                    )}
                    {results.metadata.toolsUsed && results.metadata.toolsUsed.length > 0 && (
                      <p><strong>Tools Used:</strong> {results.metadata.toolsUsed.join(', ')}</p>
                    )}
                    {results.metadata.error && (
                      <p className="text-red-600"><strong>Error:</strong> {results.metadata.error}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-medium text-gray-900 cursor-pointer">
                  View Raw JSON Response
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto bg-white p-3 rounded border">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Sample Addresses */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sample Addresses to Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => setAddress('123 Main St, Trenton, NJ 08608')}
                className="text-left p-2 hover:bg-gray-100 rounded text-indigo-600 hover:text-indigo-800"
              >
                New Jersey: 123 Main St, Trenton, NJ 08608
              </button>
              <button
                onClick={() => setAddress('456 Oak Ave, Richmond, VA 23219')}
                className="text-left p-2 hover:bg-gray-100 rounded text-indigo-600 hover:text-indigo-800"
              >
                Virginia: 456 Oak Ave, Richmond, VA 23219
              </button>
              <button
                onClick={() => setAddress('789 Pine St, Dover, DE 19901')}
                className="text-left p-2 hover:bg-gray-100 rounded text-indigo-600 hover:text-indigo-800"
              >
                Delaware: 789 Pine St, Dover, DE 19901
              </button>
              <button
                onClick={() => setAddress('321 Elm Dr, Concord, NH 03301')}
                className="text-left p-2 hover:bg-gray-100 rounded text-indigo-600 hover:text-indigo-800"
              >
                New Hampshire: 321 Elm Dr, Concord, NH 03301
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestResponsesAPI
