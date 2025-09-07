// Ballotpedia Election API Service using OpenAI
// Requires VITE_OPENAI_API_KEY in environment variables

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

if (!API_KEY) {
  console.error('OpenAI API key not found. Set VITE_OPENAI_API_KEY in your .env.local file')
} else {
  console.log('OpenAI API key loaded successfully')
}

/**
 * Get current year for election queries
 */
const getCurrentElectionYear = () => {
  const currentYear = new Date().getFullYear()
  // Check if we're in an election year or should look ahead
  return currentYear % 2 === 0 ? currentYear : currentYear + 1
}

/**
 * Extract state from address string
 * @param {string} address - Full address string
 * @returns {string} State name or abbreviation
 */
const extractStateFromAddress = (address) => {
  const statePatterns = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  }

  // Look for state abbreviations first
  for (const [abbr, fullName] of Object.entries(statePatterns)) {
    if (address.toUpperCase().includes(abbr)) {
      return fullName
    }
  }

  // Look for full state names
  for (const fullName of Object.values(statePatterns)) {
    if (address.toLowerCase().includes(fullName.toLowerCase())) {
      return fullName
    }
  }

  throw new Error('Could not determine state from address')
}

/**
 * Make OpenAI API call
 * @param {Array} messages - Chat messages for OpenAI
 * @param {number} maxTokens - Maximum tokens for response
 * @returns {Promise<string>} OpenAI response content
 */
const callOpenAI = async (messages, maxTokens = 2000) => {
  if (!API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env.local file')
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.1 // Low temperature for factual accuracy
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    throw error
  }
}

/**
 * Fetch and parse Ballotpedia page content
 * @param {string} url - Ballotpedia URL to fetch
 * @returns {Promise<string>} Page content
 */
const fetchBallotpediaContent = async (url) => {
  try {
    // In a real implementation, you'd need a CORS proxy or backend service
    // For now, we'll simulate this with OpenAI's web browsing capability
    const messages = [
      {
        role: 'system',
        content: `You are a web content analyzer. When given a Ballotpedia URL, you should provide the key election information from that page. Focus on:
        - Election dates
        - Candidate names and parties
        - Office titles
        - Key candidate information
        - Ballot measures if any`
      },
      {
        role: 'user',
        content: `Please analyze the Ballotpedia page at: ${url}
        
        Extract the election information and format it as structured data. If you cannot access the URL directly, provide the most current information you have about elections for this page topic.`
      }
    ]

    return await callOpenAI(messages, 1500)
  } catch (error) {
    console.error('Error fetching Ballotpedia content:', error)
    throw error
  }
}

/**
 * Get state election data from Ballotpedia via OpenAI
 * @param {string} state - State name
 * @param {number} year - Election year
 * @returns {Promise<Object>} Structured election data
 */
const getStateElectionData = async (state, year) => {
  try {
    const ballotpediaUrls = [
      `https://ballotpedia.org/${state}_elections,_${year}`,
      `https://ballotpedia.org/${state}_gubernatorial_election,_${year}`,
      `https://ballotpedia.org/${state}_State_Senate_elections,_${year}`,
      `https://ballotpedia.org/${state}_House_of_Representatives_elections,_${year}`
    ]

    const messages = [
      {
        role: 'system',
        content: `You are an election data specialist. Extract state-level election information and format it as JSON matching this exact structure:

{
  "elections": [
    {
      "id": "unique_id",
      "name": "Election Name",
      "electionDay": "YYYY-MM-DD"
    }
  ],
  "contests": [
    {
      "office": "Office Title",
      "type": "General",
      "level": ["state"],
      "district": null,
      "candidates": [
        {
          "name": "Candidate Name",
          "party": "Party Name",
          "candidateUrl": null,
          "photoUrl": null
        }
      ],
      "numberElected": 1
    }
  ]
}

Focus ONLY on state-level races: Governor, State Senate, State House, Attorney General, Secretary of State, State Treasurer, and state ballot measures. Exclude federal and local races.`
      },
      {
        role: 'user',
        content: `Get the current state election information for ${state} in ${year}. 
        
        Key Ballotpedia pages to reference:
        ${ballotpediaUrls.join('\n')}
        
        Extract information about:
        1. Upcoming state elections and their dates
        2. State-level races (Governor, State Legislature, other statewide offices)
        3. Candidates running in each race with their party affiliations
        4. Any state ballot measures or propositions
        
        Return only valid JSON with no additional text or explanations.`
      }
    ]

    const response = await callOpenAI(messages, 2500)
    
    // Parse the JSON response
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      console.log('Raw response:', response)
      
      // Return empty structure if parsing fails
      return {
        elections: [],
        contests: []
      }
    }
  } catch (error) {
    console.error('Error getting state election data:', error)
    throw error
  }
}

/**
 * Main function to get election data for an address
 * @param {string} address - User's address
 * @returns {Promise<Object>} Election data matching Google Civic API structure
 */
export const getStateElectionDataByAddress = async (address) => {
  try {
    const state = extractStateFromAddress(address)
    const year = getCurrentElectionYear()
    
    console.log(`Fetching election data for ${state}, ${year}`)
    
    const electionData = await getStateElectionData(state, year)
    
    return {
      elections: electionData.elections || [],
      contests: electionData.contests || [],
      pollingLocations: [], // Not available from Ballotpedia
      state: state,
      normalizedInput: { line1: address }
    }
  } catch (error) {
    console.error('Error getting election data by address:', error)
    throw error
  }
}

/**
 * Filter contests to only include state-level races (compatibility function)
 * @param {Array} contests - Array of contest objects
 * @returns {Array} Filtered array of state-level contests
 */
export const filterStateContests = (contests) => {
  if (!contests || !Array.isArray(contests)) return []
  
  return contests.filter(contest => {
    const level = contest.level || []
    return level.includes('state') || level.includes('State')
  })
}

/**
 * Format address for API (compatibility function)
 * @param {Object} addressData - Object with address components
 * @returns {string} Formatted address string
 */
export const formatAddressForAPI = (addressData) => {
  const { streetAddress, city, state, zipCode } = addressData
  return `${streetAddress}, ${city}, ${state} ${zipCode}`.trim()
}

/**
 * Format candidate information (compatibility function)
 * @param {Object} candidate - Candidate object
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
    channels: candidate.channels || []
  }
}

/**
 * Format contest information (compatibility function)
 * @param {Object} contest - Contest object
 * @returns {Object} Formatted contest information
 */
export const formatContest = (contest) => {
  return {
    office: contest.office || 'Unknown Office',
    type: contest.type || 'General',
    level: contest.level || ['state'],
    district: contest.district || null,
    candidates: contest.candidates ? contest.candidates.map(formatCandidate) : [],
    numberElected: contest.numberElected || 1,
    numberVotingFor: contest.numberVotingFor || 1,
    ballotTitle: contest.ballotTitle || null,
    referendumTitle: contest.referendumTitle || null,
    referendumText: contest.referendumText || null
  }
}

// Legacy compatibility exports (same interface as googleCivicApi.js)
export const getElections = async () => {
  // This would need an address to work with Ballotpedia
  throw new Error('getElections requires an address with Ballotpedia API. Use getStateElectionDataByAddress instead.')
}

export const getVoterInfo = async (address) => {
  return await getStateElectionDataByAddress(address)
}

export { getStateElectionDataByAddress as getStateElectionData }
