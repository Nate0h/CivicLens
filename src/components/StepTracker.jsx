import React from 'react'

const StepTracker = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Basic Info', path: '/onboarding/basic-info' },
    { number: 2, title: 'Priority Issues', path: '/onboarding/priority-issues' },
    { number: 3, title: 'Opinion Survey', path: '/onboarding/opinion-survey' },
    { number: 4, title: 'Review', path: '/onboarding/review' }
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <React.Fragment key={step.number}>
                <li className="flex flex-col items-center">
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium
                    ${currentStep === step.number 
                      ? 'border-indigo-600 bg-indigo-600 text-white' 
                      : currentStep > step.number
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2">
                    <p className={`text-sm font-medium text-center ${
                      currentStep >= step.number ? 'text-indigo-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </li>
                {stepIdx !== steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={`h-0.5 ${currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}

export default StepTracker
