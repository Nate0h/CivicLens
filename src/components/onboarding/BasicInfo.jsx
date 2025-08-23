import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepTracker from '../StepTracker'

function BasicInfo() {
  const [formData, setFormData] = useState({
    currentOccupation: '',
    annualIncome: '',
    housingStatus: '',
    ageGroup: '',
    educationLevel: '',
    familyStatus: '',
    healthcareCoverage: '',
    hasChildren: false,
    futureChanges: ''
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Save basic info data
    console.log('Basic Info:', formData)
    navigate('/onboarding/priority-issues')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StepTracker currentStep={1} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Basic Info</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Occupation */}
            <div>
              <label htmlFor="currentOccupation" className="block text-sm font-medium text-gray-700 mb-2">
                Current Occupation
              </label>
              <input
                type="text"
                id="currentOccupation"
                name="currentOccupation"
                value={formData.currentOccupation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Annual Income */}
              <div>
                <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Income
                </label>
                <select
                  id="annualIncome"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select income range</option>
                  <option value="under-25k">Under $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k-75k">$50,000 - $75,000</option>
                  <option value="75k-100k">$75,000 - $100,000</option>
                  <option value="100k-150k">$100,000 - $150,000</option>
                  <option value="150k-200k">$150,000 - $200,000</option>
                  <option value="over-200k">Over $200,000</option>
                </select>
              </div>

              {/* Housing Status */}
              <div>
                <label htmlFor="housingStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Housing Status
                </label>
                <select
                  id="housingStatus"
                  name="housingStatus"
                  value={formData.housingStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select housing status</option>
                  <option value="own">Own</option>
                  <option value="rent">Rent</option>
                  <option value="living-with-family">Living with family</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age Group */}
              <div>
                <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select age group</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-55">46-55</option>
                  <option value="56-65">56-65</option>
                  <option value="over-65">Over 65</option>
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select education level</option>
                  <option value="high-school">High School</option>
                  <option value="some-college">Some College</option>
                  <option value="associates">Associate's Degree</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="doctorate">Doctorate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Family Status */}
              <div>
                <label htmlFor="familyStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Family Status
                </label>
                <select
                  id="familyStatus"
                  name="familyStatus"
                  value={formData.familyStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select family status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="domestic-partnership">Domestic Partnership</option>
                </select>
              </div>

              {/* Healthcare Coverage */}
              <div>
                <label htmlFor="healthcareCoverage" className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Coverage
                </label>
                <select
                  id="healthcareCoverage"
                  name="healthcareCoverage"
                  value={formData.healthcareCoverage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select healthcare coverage</option>
                  <option value="employer-provided">Employer Provided</option>
                  <option value="self-purchased">Self Purchased</option>
                  <option value="government-program">Government Program (Medicare/Medicaid)</option>
                  <option value="none">None</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Has Children Checkbox */}
            <div className="flex items-center">
              <input
                id="hasChildren"
                name="hasChildren"
                type="checkbox"
                checked={formData.hasChildren}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="hasChildren" className="ml-2 block text-sm text-gray-900">
                I have children
              </label>
            </div>

            {/* Future Changes */}
            <div>
              <label htmlFor="futureChanges" className="block text-sm font-medium text-gray-700 mb-2">
                Do you expect any of this information to change in the next few years? (Optional)
              </label>
              <textarea
                id="futureChanges"
                name="futureChanges"
                rows={3}
                value={formData.futureChanges}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Planning to buy a house, expecting a promotion, planning to have children, retiring soon..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Continue to Priority Issues
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BasicInfo
