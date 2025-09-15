/**
 * Candidate Analysis Service
 * Analyzes candidate positions against user survey responses to provide personalized recommendations
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

/**
 * Topic mapping from survey IDs to readable titles
 */
const TOPIC_TITLES = {
  healthcare: 'Healthcare',
  education: 'Education', 
  'economy-jobs': 'Economy & Jobs',
  taxes: 'Taxes',
  'climate-environment': 'Climate & Environment',
  immigration: 'Immigration',
  'criminal-justice': 'Criminal Justice',
  'foreign-policy': 'Foreign Policy',
  'social-security': 'Social Security',
  housing: 'Housing',
  infrastructure: 'Infrastructure',
  'civil-rights': 'Civil Rights',
  'gun-policy': 'Gun Policy',
  'technology-privacy': 'Technology & Privacy'
}

/**
 * Survey questions bank for context (matches OpinionSurvey.jsx)
 */
const QUESTION_BANK = {
  healthcare: [
    "Government should provide universal healthcare coverage for all citizens.",
    "Private healthcare insurance should be the primary way people get coverage.",
    "Healthcare costs should be regulated by the government to keep them affordable."
  ],
  education: [
    "Public schools should receive more funding from the government.",
    "School choice programs should be expanded to give parents more options.",
    "The government should spend more money to help people learn new job skills."
  ],
  'economy-jobs': [
    "Cutting taxes for businesses is a good way to create more jobs.",
    "The government should regulate large corporations more strictly.",
    "The lowest hourly pay for workers should be raised."
  ],
  taxes: [
    "Wealthy individuals should pay higher tax rates than they currently do.",
    "Government spending should be reduced rather than raising taxes.",
    "Tax cuts stimulate economic growth better than government spending."
  ],
  'climate-environment': [
    "The government should invest heavily in renewable energy sources.",
    "Environmental regulations should be reduced to help businesses grow.",
    "Climate change is one of the most urgent issues facing our country."
  ],
  immigration: [
    "Immigration levels should be increased to help fill job shortages.",
    "Border security should be the top priority in immigration policy.",
    "Undocumented immigrants should have a path to legal status."
  ],
  'criminal-justice': [
    "Police departments should receive more funding and resources.",
    "Criminal justice reform should focus more on rehabilitation than punishment.",
    "Community programs are more effective than policing at preventing crime."
  ],
  'foreign-policy': [
    "Military spending should be increased to maintain national security.",
    "The U.S. should reduce its military involvement in other countries.",
    "Defense spending should be redirected to domestic programs."
  ],
  'social-security': [
    "Social Security benefits should be expanded for all retirees.",
    "The retirement age should be raised to ensure Social Security's future.",
    "Social Security should be privatized to give individuals more control."
  ],
  housing: [
    "The government should help make sure people can afford a place to live.",
    "Laws that limit how much landlords can raise rent are good for communities.",
    "We should build more homes and apartments, even if it makes neighborhoods more crowded."
  ],
  infrastructure: [
    "The government should invest more in roads, bridges, and public transportation.",
    "Private companies should take the lead role in infrastructure projects.",
    "Infrastructure spending should focus on green and sustainable projects."
  ],
  'civil-rights': [
    "The government should do more to ensure equal rights for all groups.",
    "Anti-discrimination laws should be strengthened and better enforced.",
    "Individual liberty should take priority over government equality programs."
  ],
  'gun-policy': [
    "Gun control laws should be stricter to reduce gun violence.",
    "The Second Amendment protects individual rights to own firearms.",
    "Background checks should be required for all gun purchases."
  ],
  'technology-privacy': [
    "Large tech companies should be regulated more strictly by the government.",
    "Government should invest more in technology education and training.",
    "Privacy regulations should be strengthened for online platforms."
  ]
}

/**
 * Get detailed candidate analysis using OpenAI Responses API
 * @param {Object} electionData - Election data with candidates
 * @param {Object} userSurveyData - User's survey responses and priority topics
 * @returns {Promise<Object>} Detailed analysis with overall assessment and topic breakdowns
 */
export const getCandidateAnalysis = async (electionData, userSurveyData) => {
  try {
    console.log('🔍 Starting candidate analysis...')
    console.log('📊 Election data:', electionData)
    console.log('📋 User survey data:', userSurveyData)

    // Validate inputs
    if (!electionData?.candidates || electionData.candidates.length === 0) {
      throw new Error('No candidates found in election data')
    }

    if (!userSurveyData?.priorityTopics || userSurveyData.priorityTopics.length === 0) {
      throw new Error('No priority topics found in user survey data')
    }

    // Create the analysis request
    const response = await createAnalysisResponse(electionData, userSurveyData)
    
    // Poll for completion
    const completedResponse = await pollResponseCompletion(response.id)
    
    // Extract and structure the analysis
    const analysisData = await extractAnalysisData(completedResponse)
    
    console.log('✅ Candidate analysis completed successfully')
    return analysisData

  } catch (error) {
    console.error('❌ Failed to get candidate analysis:', error)
    throw new Error(`Failed to analyze candidates: ${error.message}`)
  }
}

/**
 * Create analysis response using OpenAI Responses API with web search for candidate positions
 */
const createAnalysisResponse = async (electionData, userSurveyData) => {
  const { candidates } = electionData
  const { priorityTopics, surveyResponses } = userSurveyData

  // Build user preference context
  const userPreferences = buildUserPreferenceContext(priorityTopics, surveyResponses)
  
  // Build candidate list
  const candidateList = candidates.map(c => `${c.name} (${c.party})`).join(', ')

  const requestBody = {
    model: "gpt-4.1",
    tools: [{ 
      type: "web_search",
    }],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    input: `You are analyzing candidates for the ${electionData.name || 'election'} to provide personalized recommendations based on a voter's survey responses.

CANDIDATES TO ANALYZE: ${candidateList}

USER'S PRIORITY TOPICS AND PREFERENCES:
${userPreferences}

TASK: Research each candidate's detailed positions on the user's priority topics using current information from Ballotpedia and other reliable sources. Then provide a comprehensive analysis in this exact JSON format:

{
  "overallAssessment": "A detailed paragraph explaining which candidates align most closely with the voter's expressed priorities, particularly highlighting the strongest and weakest alignments across all topics.",
  "topicAnalysis": [
    {
      "topic": "topic-id",
      "topicTitle": "Topic Title",
      "candidates": [
        {
          "name": "Candidate Name",
          "party": "Party",
          "stance": "Detailed description of candidate's position on this topic",
          "alignment": "strong" | "moderate" | "weak" | "opposed",
          "alignmentReason": "Explanation of why this alignment score was given based on user's survey responses"
        }
      ]
    }
  ],
  "metadata": {
    "analysisDate": "${new Date().toISOString()}",
    "topicsAnalyzed": ${JSON.stringify(priorityTopics)},
    "candidatesAnalyzed": ${candidates.length}
  }
}

ALIGNMENT SCORING GUIDE:
- "strong": Candidate's position closely matches user's preferences (survey responses 4-5 align with candidate's stance)
- "moderate": Candidate's position partially matches user's preferences (some alignment but not complete)
- "weak": Candidate's position has minimal alignment with user's preferences
- "opposed": Candidate's position directly contradicts user's preferences (survey responses 1-2 oppose candidate's stance)

Focus on finding specific policy positions, voting records, and public statements for each candidate on each topic. Be thorough and accurate in your research.`
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
 * Build user preference context from survey responses
 */
const buildUserPreferenceContext = (priorityTopics, surveyResponses) => {
  let context = ''
  
  priorityTopics.forEach(topicId => {
    const topicTitle = TOPIC_TITLES[topicId] || topicId
    const questions = QUESTION_BANK[topicId] || []
    
    context += `\n${topicTitle.toUpperCase()}:\n`
    
    questions.forEach((question, index) => {
      const questionId = `${topicId}_${index}`
      const response = surveyResponses[questionId]
      
      if (response !== undefined) {
        const responseText = getResponseText(response)
        context += `- "${question}" → User response: ${responseText}\n`
      }
    })
  })
  
  return context
}

/**
 * Convert Likert scale number to text
 */
const getResponseText = (value) => {
  const responses = {
    1: 'Strongly Disagree',
    2: 'Disagree', 
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  }
  return responses[value] || 'Unknown'
}

/**
 * Poll for response completion (reusing from ballotpediaResponsesApi.js)
 */
const pollResponseCompletion = async (responseId, maxAttempts = 30, intervalMs = 2000) => {
  console.log('⏳ Polling for analysis completion...')
  
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
        console.log('✅ Analysis completed')
        return data
      } else if (data.status === 'failed') {
        throw new Error(`Analysis failed: ${data.error?.message || 'Unknown error'}`)
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
  
  throw new Error('Analysis polling timed out')
}

/**
 * Extract and structure analysis data from completed response
 */
const extractAnalysisData = async (completedResponse) => {
  try {
    console.log('📥 Full completed response:', JSON.stringify(completedResponse, null, 2))
    
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
    console.log('📥 Raw analysis content:', responseContent)

    // Try multiple JSON extraction methods
    let analysisData = null
    
    // Method 1: Look for ```json blocks
    const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        const jsonString = jsonMatch[1].trim()
        analysisData = JSON.parse(jsonString)
        console.log('✅ Extracted JSON from ```json block')
      } catch (parseError) {
        console.log('⚠️ Failed to parse JSON from ```json block:', parseError.message)
      }
    }
    
    // Method 2: Look for plain ``` blocks
    if (!analysisData) {
      const codeMatch = responseContent.match(/```\s*([\s\S]*?)\s*```/)
      if (codeMatch) {
        try {
          const jsonString = codeMatch[1].trim()
          analysisData = JSON.parse(jsonString)
          console.log('✅ Extracted JSON from ``` block')
        } catch (parseError) {
          console.log('⚠️ Failed to parse JSON from ``` block:', parseError.message)
        }
      }
    }
    
    // Method 3: Look for JSON object in the text (starts with { and ends with })
    if (!analysisData) {
      const jsonObjectMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonObjectMatch) {
        try {
          const jsonString = jsonObjectMatch[0]
          analysisData = JSON.parse(jsonString)
          console.log('✅ Extracted JSON object from text')
        } catch (parseError) {
          console.log('⚠️ Failed to parse JSON object from text:', parseError.message)
        }
      }
    }
    
    // Method 4: Try to parse the entire response content as JSON
    if (!analysisData) {
      try {
        analysisData = JSON.parse(responseContent)
        console.log('✅ Parsed entire response as JSON')
      } catch (parseError) {
        console.log('⚠️ Failed to parse entire response as JSON:', parseError.message)
      }
    }
    
    if (!analysisData) {
      throw new Error(`No valid JSON found in response. Raw content: ${responseContent.substring(0, 500)}...`)
    }
    
    // Validate the structure
    if (!analysisData.overallAssessment) {
      console.log('⚠️ Missing overallAssessment, creating fallback')
      analysisData.overallAssessment = 'Analysis completed but overall assessment not available.'
    }
    
    if (!analysisData.topicAnalysis) {
      console.log('⚠️ Missing topicAnalysis, creating empty array')
      analysisData.topicAnalysis = []
    }
    
    // Add additional metadata
    return {
      ...analysisData,
      metadata: {
        ...analysisData.metadata,
        fetchedAt: new Date().toISOString(),
        method: 'openai_responses_api_candidate_analysis',
        responseId: completedResponse.id,
        sources: output.find(item => item.type === 'web_search_call')?.action?.sources || []
      }
    }

  } catch (error) {
    console.error('❌ Failed to extract analysis data:', error)
    
    // Return fallback structure
    return {
      overallAssessment: `Analysis could not be completed. Error: ${error.message}`,
      topicAnalysis: [],
      metadata: {
        fetchedAt: new Date().toISOString(),
        method: 'openai_responses_api_candidate_analysis',
        error: error.message,
        rawResponse: completedResponse?.output ? JSON.stringify(completedResponse.output, null, 2) : 'No output available'
      }
    }
  }
}

/**
 * Get user survey data from localStorage
 * @param {string} sessionId - User session ID
 * @returns {Object} User survey data with priority topics and responses
 */
export const getUserSurveyData = (sessionId) => {
  try {
    // Get priority topics
    const priorityTopicsData = localStorage.getItem(`onboarding_priority_issues_${sessionId}`)
    const priorityTopics = priorityTopicsData ? JSON.parse(priorityTopicsData) : []

    // Get survey responses
    const surveyResponsesData = localStorage.getItem(`onboarding_survey_responses_${sessionId}`)
    const surveyResponses = surveyResponsesData ? JSON.parse(surveyResponsesData) : {}

    return {
      priorityTopics,
      surveyResponses,
      sessionId
    }
  } catch (error) {
    console.error('❌ Failed to get user survey data:', error)
    return {
      priorityTopics: [],
      surveyResponses: {},
      sessionId
    }
  }
}

/**
 * Validate that user has completed the survey for analysis
 * @param {Object} userSurveyData - User survey data
 * @returns {boolean} Whether user data is sufficient for analysis
 */
export const validateUserDataForAnalysis = (userSurveyData) => {
  const { priorityTopics, surveyResponses } = userSurveyData
  
  // Must have at least one priority topic
  if (!priorityTopics || priorityTopics.length === 0) {
    return false
  }
  
  // Must have some survey responses
  if (!surveyResponses || Object.keys(surveyResponses).length === 0) {
    return false
  }
  
  // Check if user has answered questions for their priority topics
  let hasAnswersForPriorityTopics = false
  priorityTopics.forEach(topicId => {
    for (let i = 0; i < 3; i++) { // Each topic has 3 questions
      const questionId = `${topicId}_${i}`
      if (surveyResponses[questionId] !== undefined) {
        hasAnswersForPriorityTopics = true
        break
      }
    }
  })
  
  return hasAnswersForPriorityTopics
}
