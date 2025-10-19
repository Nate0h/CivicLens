/**
 * Ballotpedia Election Data Service using OpenAI Responses API with Web Search
 * Uses OpenAI's web_search_preview tool to find and analyze Ballotpedia election pages
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

/**
 * Extract state from address stringnpm 
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

  // Look for state abbreviations as whole words
  for (const [abbr, fullName] of Object.entries(statePatterns)) {
    const stateRegex = new RegExp(`\\b${abbr}\\b`, 'i')
    if (stateRegex.test(address)) {
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
 * Get election data by address using OpenAI Responses API with web search
 * @param {string} address - User's address
 * @param {number} year - Election year
 * @returns {Promise<Object>} Structured election data
 */
export const getElectionDataByAddress = async (address, year = 2025) => {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  try {
    console.log(`🔍 [${requestId}] Fetching election data using OpenAI Responses API...`)
    console.log(`📍 [${requestId}] Address:`, address, 'Year:', year)

    // Extract state from address
    const state = extractStateFromAddress(address)
    console.log('🏛️ State detected:', state)

    // Create the response with web search tool
    const response = await createResponseWithWebSearch(state, year)
    
    // Poll for completion
    const completedResponse = await pollResponseCompletion(response.id)
    
    // Extract and structure the data
    const structuredData = await extractElectionData(completedResponse)
    
    console.log(`✅ [${requestId}] Election data fetched successfully`)
    return {
      ...structuredData,
      state: state,
      normalizedInput: { line1: address }
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Failed to fetch election data:`, error)
    throw new Error(`Failed to get election data: ${error.message}`)
  }
}

/**
 * Create a response using OpenAI Responses API with web search
 */
const createResponseWithWebSearch = async (state, year) => {
  const requestBody = {
    model: "gpt-5",
    tools: [{ 
      type: "web_search"
    }],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    input: `Find who is running for the ${year} ${state} governor and lieutenant governor election, and their party affiliation. 
    IMPORTANT: Create SEPARATE election entries for Governor and Lieutenant Governor races, even if candidates run as a ticket.
    Return the data in JSON format with this structure: {"elections": [{"id": "unique_election_id", "name": "Election Name", "electionDay": "YYYY-MM-DD", "office": "Governor", "candidates": [{"name": "Full Candidate Name", "party": "Party Name", "office": "Governor", "candidateUrl": null, "photoUrl": null}]}]}. Focus only on current active candidates and ignore historical data.`
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
  }

  return await response.json()
}

/**
 * Poll for response completion with progressive intervals
 * Starts with faster checks and gradually increases interval
 */
const pollResponseCompletion = async (responseId, maxAttempts = 40) => {
  console.log('⏳ Polling for response completion...')
  
  // Progressive polling intervals: faster at first, slower later
  const getInterval = (attempt) => {
    if (attempt <= 5) return 1000      // First 5 attempts: 1 second
    if (attempt <= 15) return 2000     // Next 10 attempts: 2 seconds
    return 3000                         // Remaining attempts: 3 seconds
  }
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://api.openai.com/v1/responses/${responseId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === 'completed') {
        const totalTime = (attempt <= 5 ? attempt * 1 : 5 + (attempt - 5) * 2)
        console.log(`✅ Response completed in ~${totalTime} seconds`)
        return data
      } else if (data.status === 'failed') {
        throw new Error(`Response failed: ${data.error?.message || 'Unknown error'}`)
      }
      
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Status: ${data.status}`)
      
      if (attempt < maxAttempts) {
        const interval = getInterval(attempt)
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      console.log(`⚠️ Polling attempt ${attempt} failed, retrying...`)
      const interval = getInterval(attempt)
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
  
  throw new Error('Response polling timed out after ~90 seconds')
}

/**
 * Extract and structure election data from completed response
 */
const extractElectionData = async (completedResponse) => {
  try {
    // Get the response content from the Responses API format
    // The response has an 'output' array with different types of objects
    const output = completedResponse.output
    
    if (!output || !Array.isArray(output)) {
      throw new Error('No output array found in response')
    }

    // Find the message object that contains the text response
    const messageObject = output.find(item => item.type === 'message' && item.content)
    
    if (!messageObject) {
      throw new Error('No message object found in response output')
    }

    // Extract the text from the content array
    const textContent = messageObject.content.find(content => content.type === 'output_text')
    
    if (!textContent || !textContent.text) {
      throw new Error('No text content found in message')
    }

    const responseContent = textContent.text
    console.log('📥 Raw response content:', responseContent)

    // Parse direct JSON from GPT-5
    let structuredData
    try {
      structuredData = JSON.parse(responseContent.trim())
      console.log('✅ Parsed JSON successfully:', JSON.stringify(structuredData, null, 2))
    } catch (parseError) {
      console.warn('⚠️ Direct JSON parse failed, trying fallback...', parseError.message)
      // Fallback: try to find JSON object in the text
      const directJsonMatch = responseContent.match(/{[\s\S]*}/)
      if (!directJsonMatch) {
        throw new Error('No valid JSON found in response')
      }
      structuredData = JSON.parse(directJsonMatch[0])
      console.log('✅ Parsed JSON with fallback:', JSON.stringify(structuredData, null, 2))
    }
    
    // Log election dates for debugging
    if (structuredData.elections) {
      structuredData.elections.forEach((election, index) => {
        console.log(`📅 Election ${index + 1}: ${election.name} - Date: ${election.electionDay}`)
      })
    }
    
    // Add metadata
    return {
      ...structuredData,
      metadata: {
        fetchedAt: new Date().toISOString(),
        method: 'openai_responses_api_web_search',
        responseId: completedResponse.id,
        sources: output.find(item => item.type === 'web_search_call')?.action?.sources || []
      }
    }

  } catch (error) {
    console.error('❌ Failed to extract election data:', error)
    
    // Fallback structure
    return {
      elections: [{
        id: 'unknown_election',
        name: 'Election Data Unavailable',
        electionDay: '2025-11-04',
        office: 'Governor',
        candidates: []
      }],
      metadata: {
        fetchedAt: new Date().toISOString(),
        method: 'openai_responses_api_web_search',
        error: error.message
      }
    }
  }
}

// Legacy compatibility exports
export const getVoterInfo = async (address) => {
  return await getElectionDataByAddress(address)
}

export const getStateElectionDataByAddress = async (address) => {
  return await getElectionDataByAddress(address)
}
