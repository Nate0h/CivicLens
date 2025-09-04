import React, { useState, useEffect } from 'react'
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
    futureChanges: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const navigate = useNavigate()

  // Load saved form data on component mount
  useEffect(() => {
    // Generate a unique session ID for this user session
    const sessionId = sessionStorage.getItem('user_session_id') || 
                     `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('user_session_id', sessionId)
    
    const savedFormData = localStorage.getItem(`onboarding_basic_info_${sessionId}`)
    if (savedFormData) {
      try {
        const parsedFormData = JSON.parse(savedFormData)
        setFormData(parsedFormData)
      } catch (error) {
        console.error('Error loading saved basic info:', error)
      }
    }
  }, [])

  // Save form data whenever it changes
  useEffect(() => {
    if (Object.values(formData).some(value => value !== '' && value !== false)) {
      const sessionId = sessionStorage.getItem('user_session_id')
      if (sessionId) {
        localStorage.setItem(`onboarding_basic_info_${sessionId}`, JSON.stringify(formData))
      }
    }
  }, [formData])

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

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Address <span className="text-gray-500 text-sm font-normal">(for election information)</span>
              </h3>
              <p className="text-sm text-gray-600">
                We'll use this to show you relevant state election information and candidates.
              </p>
              
              {/* Street Address */}
              <div>
                <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City/Town
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Anytown"
                    required
                  />
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select state</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
                </div>

                {/* Zip Code */}
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 12345"
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    required
                  />
                </div>
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
