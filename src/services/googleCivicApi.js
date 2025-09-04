// Google Civic Information API Service
// Requires VITE_GOOGLE_CIVIC_API_KEY in environment variables

const API_BASE_URL = 'https://www.googleapis.com/civicinfo/v2'
const API_KEY = import.meta.env.VITE_GOOGLE_CIVIC_API_KEY

if (!API_KEY) {
  console.error('Google Civic API key not found. Set VITE_GOOGLE_CIVIC_API_KEY in your .env.local file')
  console.log('Available env vars:', Object.keys(import.meta.env))
} else {
  console.log('Google Civic API key loaded successfully')
  console.log('API key length:', API_KEY.length)
  console.log('API key starts with:', API_KEY.substring(0, 10) + '...')
  console.log('API key character codes:', [...API_KEY].slice(0, 10).map(c => c.charCodeAt(0)))
  console.log('API key trimmed length:', API_KEY.trim().length)
}

/**
 * Fetch upcoming elections
 * @returns {Promise<Array>} Array of election objects
 */
export const getElections = async () => {
  if (!API_KEY) {
    throw new Error('Google Civic API key is not configured. Please set VITE_GOOGLE_CIVIC_API_KEY in your .env.local file')
  }

  try {
    const url = `${API_BASE_URL}/elections?key=${API_KEY}`
    console.log('Fetching elections from:', url.replace(API_KEY, '[API_KEY]'))
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      console.error('Response status:', response.status)
      console.error('Response headers:', [...response.headers.entries()])
      throw new Error(`Elections API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    return data.elections || []
  } catch (error) {
    console.error('Error fetching elections:', error)
    throw error
  }
}

/**
 * Fetch voter information for a specific address and election
 * @param {string} address - User's address
 * @param {string} electionId - Election ID (optional, defaults to upcoming election)
 * @returns {Promise<Object>} Voter information including contests and candidates
 */
export const getVoterInfo = async (address, electionId = null) => {
  if (!API_KEY) {
    throw new Error('Google Civic API key is not configured. Please set VITE_GOOGLE_CIVIC_API_KEY in your .env.local file')
  }

  try {
    let url = `${API_BASE_URL}/voterinfo?key=${API_KEY}&address=${encodeURIComponent(address)}`
    
    if (electionId) {
      url += `&electionId=${electionId}`
    }
    
    console.log('Fetching voter info from:', url.replace(API_KEY, '[API_KEY]'))
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`Voter info API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching voter info:', error)
    throw error
  }
}

/**
 * Filter contests to only include state-level races
 * @param {Array} contests - Array of contest objects from voter info
 * @returns {Array} Filtered array of state-level contests
 */
export const filterStateContests = (contests) => {
  if (!contests || !Array.isArray(contests)) return []
  
  return contests.filter(contest => {
    const office = contest.office?.toLowerCase() || ''
    const level = contest.level?.[0]?.toLowerCase() || ''
    
    // Include state-level offices
    const isStateOffice = office.includes('governor') || 
                         office.includes('state senate') ||
                         office.includes('state house') ||
                         office.includes('state representative') ||
                         office.includes('state assembly') ||
                         office.includes('attorney general') ||
                         office.includes('secretary of state') ||
                         office.includes('state treasurer') ||
                         office.includes('state controller') ||
                         office.includes('state auditor')
    
    // Include by level designation
    const isStateLevel = level === 'state'
    
    // Include state ballot measures
    const isBallotMeasure = contest.type === 'Referendum' && level === 'state'
    
    return isStateOffice || isStateLevel || isBallotMeasure
  })
}

/**
 * Format granular address into single string for API
 * @param {Object} addressData - Object with streetAddress, city, state, zipCode
 * @returns {string} Formatted address string
 */
export const formatAddressForAPI = (addressData) => {
  const { streetAddress, city, state, zipCode } = addressData
  return `${streetAddress}, ${city}, ${state} ${zipCode}`.trim()
}

/**
 * Get state election data for a specific address
 * @param {string|Object} address - User's address (string or granular object)
 * @returns {Promise<Object>} Object containing elections and state contests
 */
export const getStateElectionData = async (address) => {
  try {
    // Get upcoming elections
    const elections = await getElections()
    
    // Get voter info for the address
    const voterInfo = await getVoterInfo(address)
    
    // Filter to state-level contests only
    const stateContests = filterStateContests(voterInfo.contests)
    
    return {
      elections: elections.filter(election => {
        // Filter to upcoming elections only
        const electionDate = new Date(election.electionDay)
        const today = new Date()
        return electionDate >= today
      }),
      contests: stateContests,
      pollingLocations: voterInfo.pollingLocations || [],
      state: voterInfo.state || null,
      normalizedInput: voterInfo.normalizedInput || null
    }
  } catch (error) {
    console.error('Error getting state election data:', error)
    throw error
  }
}

/**
 * Format candidate information for display
 * @param {Object} candidate - Candidate object from API
 * @returns {Object} Formatted candidate information
 */
export const formatCandidate = (candidate) => {
  return {
    name: candidate.name || 'Unknown',
    party: candidate.party || 'No party affiliation',
    candidateUrl: candidate.candidateUrl || null,
    photoUrl: candidate.photoUrl || null,
    email: candidate.email || null,
    phone: candidate.phone || null,
    channels: candidate.channels || [] // Social media channels
  }
}

/**
 * Format contest information for display
 * @param {Object} contest - Contest object from API
 * @returns {Object} Formatted contest information
 */
export const formatContest = (contest) => {
  return {
    office: contest.office || 'Unknown Office',
    type: contest.type || 'General',
    level: contest.level || [],
    district: contest.district || null,
    candidates: contest.candidates ? contest.candidates.map(formatCandidate) : [],
    numberElected: contest.numberElected || 1,
    numberVotingFor: contest.numberVotingFor || 1,
    ballotTitle: contest.ballotTitle || null,
    referendumTitle: contest.referendumTitle || null,
    referendumText: contest.referendumText || null
  }
}
