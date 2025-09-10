/**
 * Ballotpedia Election Data Service using OpenAI Responses API with Web Search
 * Uses OpenAI's web_search_preview tool to find and analyze Ballotpedia election pages
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

/**
 * Extract state from address string
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
  try {
    console.log('🔍 Fetching election data using OpenAI Responses API...')
    console.log('📍 Address:', address, 'Year:', year)

    // Extract state from address
    const state = extractStateFromAddress(address)
    console.log('🏛️ State detected:', state)

    // Create the response with web search tool
    const response = await createResponseWithWebSearch(state, year)
    
    // Poll for completion
    const completedResponse = await pollResponseCompletion(response.id)
    
    // Extract and structure the data
    const structuredData = await extractElectionData(completedResponse)
    
    console.log('✅ Election data fetched successfully')
    return {
      ...structuredData,
      state: state,
      normalizedInput: { line1: address }
    }

  } catch (error) {
    console.error('❌ Failed to fetch election data:', error)
    throw new Error(`Failed to get election data: ${error.message}`)
  }
}

/**
 * Create a response using OpenAI Responses API with web search
 */
const createResponseWithWebSearch = async (state, year) => {
  const requestBody = {
    model: "gpt-4.1",
    tools: [{ 
    type: "web_search",
    }],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    input: `Find who is running for the ${year} ${state} governor and lieutenant governor election, and their party affiliation. Return the data in JSON format with this structure: {"elections": [{"id": "unique_election_id", "name": "Election Name", "electionDay": "YYYY-MM-DD", "office": "Governor", "candidates": [{"name": "Full Candidate Name", "party": "Party Name", "office": "Governor", "candidateUrl": null, "photoUrl": null}]}]}. Focus only on current active candidates and ignore historical data.`
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
 * Poll for response completion
 */
const pollResponseCompletion = async (responseId, maxAttempts = 30, intervalMs = 2000) => {
  console.log('⏳ Polling for response completion...')
  
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
        console.log('✅ Response completed')
        return data
      } else if (data.status === 'failed') {
        throw new Error(`Response failed: ${data.error?.message || 'Unknown error'}`)
      }
      
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Status: ${data.status}`)
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      console.log(`⚠️ Polling attempt ${attempt} failed, retrying...`)
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }
  
  throw new Error('Response polling timed out')
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

    // Extract JSON from the text (it's wrapped in ```json blocks)
    const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/)
    
    if (!jsonMatch) {
      throw new Error('No JSON block found in response')
    }

    const jsonString = jsonMatch[1].trim()
    const structuredData = JSON.parse(jsonString)
    
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
