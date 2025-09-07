// Test script for Ballotpedia Election API
import { getStateElectionDataByAddress } from './ballotpediaElectionApi.js'

/**
 * Test the Ballotpedia API with a sample address
 */
export const testElectionAPI = async () => {
  try {
    console.log('Testing Ballotpedia Election API...')
    
    // Test with a sample Texas address
    const testAddress = "123 Main St, Austin, TX 78701"
    console.log(`Testing with address: ${testAddress}`)
    
    const result = await getStateElectionDataByAddress(testAddress)
    
    console.log('API Test Results:')
    console.log('Elections found:', result.elections?.length || 0)
    console.log('Contests found:', result.contests?.length || 0)
    console.log('State detected:', result.state)
    
    if (result.contests && result.contests.length > 0) {
      console.log('\nSample contest:')
      console.log(JSON.stringify(result.contests[0], null, 2))
    }
    
    return result
  } catch (error) {
    console.error('API Test Failed:', error.message)
    throw error
  }
}

// Export for manual testing in browser console
window.testElectionAPI = testElectionAPI
