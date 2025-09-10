/**
 * Improved Ballotpedia Election Data Service using OpenAI Responses API
 * Enhanced with better prompt engineering and verification for accurate candidate data
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
 * Get election data by address using improved OpenAI Responses API
 */
export const getElectionDataByAddress = async (address, year = 2025) => {
  try {
    console.log('🔍 Fetching election data using improved Responses API...')
    console.log('📍 Address:', address, 'Year:', year)

    const state = extractStateFromAddress(address)
    console.log('🏛️ State detected:', state)

    // Enhanced response with better verification
    const response = await createEnhancedResponseWithWebSearch(state, year)
    const completedResponse = await pollResponseCompletion(response.id)
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
 * Create enhanced response with improved prompt engineering
 */
const createEnhancedResponseWithWebSearch = async (state, year) => {
  const requestBody = {
    model: "gpt-4o-2024-11-20", // Latest model
    tools: [{ 
      type: "web_search",
      filters: {
        allowed_domains: ["ballotpedia.org"]
      }
    }],
    tool_choice: "required",
    temperature: 0.05, // Very low for factual accuracy
    input: `CRITICAL VERIFICATION TASK: Find EXACT current candidates for ${year} ${state} gubernatorial election.

MANDATORY SEARCH STEPS:
1. Search ballotpedia.org for EXACT page: "${state} gubernatorial and lieutenant gubernatorial election, ${year}"
2. Navigate to "General election" section
3. Find "Candidates" subsection listing ballot-qualified candidates
4. Cross-verify each candidate on their individual Ballotpedia page

STRICT INCLUSION CRITERIA:
✓ Candidate appears in "General election candidates" section
✓ Status shows "On the ballot" or equivalent for ${year}
✓ Party affiliation confirmed on candidate's individual page
✓ NO "withdrawn", "suspended", or "primary only" candidates
✓ NO historical or past election data

VERIFICATION CHECKLIST for each candidate:
□ Name exactly as listed on official ballot
□ Party verified from individual candidate page
□ Confirmed active status for ${year} general election
□ Not marked as withdrawn or suspended

REQUIRED OUTPUT FORMAT:
{
  "elections": [{
    "id": "${state.toLowerCase().replace(/\s+/g, '_')}_governor_${year}",
    "name": "${state} Gubernatorial Election ${year}",
    "electionDay": "${year}-11-04",
    "office": "Governor",
    "candidates": [
      {
        "name": "EXACT_BALLOT_NAME",
        "party": "VERIFIED_PARTY",
        "office": "Governor",
        "candidateUrl": null,
        "photoUrl": null,
        "verificationStatus": "confirmed"
      }
    ],
    "verificationNotes": "List sources used and any uncertainties"
  }]
}

CRITICAL: If you cannot find definitive, current, verified candidate information, return empty candidates array with explanation in verificationNotes. Better to return no data than incorrect data.`
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
 * Extract election data with enhanced parsing
 */
const extractElectionData = async (completedResponse) => {
  try {
    const output = completedResponse.output
    
    if (!output || !Array.isArray(output)) {
      throw new Error('No output array found in response')
    }

    const messageObject = output.find(item => item.type === 'message' && item.content)
    
    if (!messageObject) {
      throw new Error('No message object found in response output')
    }

    const textContent = messageObject.content.find(content => content.type === 'output_text')
    
    if (!textContent || !textContent.text) {
      throw new Error('No text content found in message')
    }

    const responseContent = textContent.text
    console.log('📥 Raw response content:', responseContent)

    const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/)
    
    if (!jsonMatch) {
      throw new Error('No JSON block found in response')
    }

    const jsonString = jsonMatch[1].trim()
    const structuredData = JSON.parse(jsonString)
    
    return {
      ...structuredData,
      metadata: {
        fetchedAt: new Date().toISOString(),
        method: 'openai_responses_api_enhanced',
        responseId: completedResponse.id,
        sources: output.find(item => item.type === 'web_search_call')?.action?.sources || []
      }
    }

  } catch (error) {
    console.error('❌ Failed to extract election data:', error)
    
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
        method: 'openai_responses_api_enhanced',
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
