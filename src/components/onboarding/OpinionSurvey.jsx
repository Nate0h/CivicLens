import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepTracker from '../StepTracker'

function OpinionSurvey() {
  const navigate = useNavigate()
  const [selectedIssues, setSelectedIssues] = useState([])
  const [surveyQuestions, setSurveyQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState({})

  // Question bank - 3 questions per topic (matching PriorityIssues IDs)
  const questionBank = {
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

  // Load selected issues and generate questions
  useEffect(() => {
    const savedSelections = localStorage.getItem('onboarding_priority_issues')
    if (savedSelections) {
      try {
        const parsedSelections = JSON.parse(savedSelections)
        setSelectedIssues(parsedSelections)
        
        // Generate questions based on selected issues
        const questions = []
        parsedSelections.forEach(issueId => {
          if (questionBank[issueId]) {
            questionBank[issueId].forEach((question, index) => {
              questions.push({
                id: `${issueId}_${index}`,
                topic: issueId,
                text: question,
                topicTitle: getTopicTitle(issueId)
              })
            })
          }
        })
        setSurveyQuestions(questions)
      } catch (error) {
        console.error('Error loading priority issues:', error)
        navigate('/onboarding/priority-issues')
      }
    } else {
      navigate('/onboarding/priority-issues')
    }
  }, [navigate])

  // Load saved responses
  useEffect(() => {
    const savedResponses = localStorage.getItem('onboarding_survey_responses')
    if (savedResponses) {
      try {
        const parsedResponses = JSON.parse(savedResponses)
        setResponses(parsedResponses)
      } catch (error) {
        console.error('Error loading saved responses:', error)
      }
    }
  }, [])

  // Save responses when they change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem('onboarding_survey_responses', JSON.stringify(responses))
    }
  }, [responses])

  const getTopicTitle = (issueId) => {
    const titles = {
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
    return titles[issueId] || issueId
  }

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      navigate('/onboarding/review')
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    } else {
      navigate('/onboarding/priority-issues')
    }
  }

  if (surveyQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized survey...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = surveyQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100
  const answeredQuestions = Object.keys(responses).length
  const isCurrentAnswered = responses[currentQuestion.id] !== undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <StepTracker currentStep={3} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Opinion Survey</h1>
              <span className="text-sm text-gray-500">
                {currentQuestionIndex + 1} of {surveyQuestions.length}
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Share your thoughts on key issues to get more personalized candidate comparisons. 
              Your responses help us show you which candidates align with your views.
            </p>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {answeredQuestions}/{surveyQuestions.length} questions</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Current Question */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {currentQuestion.topicTitle}
              </h2>
              <p className="text-gray-800 text-base leading-relaxed">
                {currentQuestion.text}
              </p>
            </div>

            {/* Likert Scale Options */}
            <div className="space-y-3">
              {[
                { value: 1, label: 'Strongly Disagree' },
                { value: 2, label: 'Disagree' },
                { value: 3, label: 'Neutral' },
                { value: 4, label: 'Agree' },
                { value: 5, label: 'Strongly Agree' }
              ].map((option) => (
                <label 
                  key={option.value}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value={option.value}
                    checked={responses[currentQuestion.id] === option.value}
                    onChange={() => handleResponse(currentQuestion.id, option.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={handlePrevious}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              {currentQuestionIndex === 0 ? 'Back to Issues' : 'Previous'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                isCurrentAnswered
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex === surveyQuestions.length - 1 ? 'Complete Survey' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpinionSurvey
