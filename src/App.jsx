import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthGuard from './components/AuthGuard'
import Home from './components/Home'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard'
import BasicInfo from './components/onboarding/BasicInfo'
import PriorityIssues from './components/onboarding/PriorityIssues'
import OpinionSurvey from './components/onboarding/OpinionSurvey'
import Review from './components/onboarding/Review'
import Profile from './components/Profile'
import TestResponsesAPI from './components/TestResponsesAPI'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test-responses" element={<TestResponsesAPI />} />
          <Route 
            path="/signin" 
            element={
              <SignIn />
            } 
          />
          <Route 
            path="/signup" 
            element={
              <SignUp />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/basic-info" 
            element={
              <AuthGuard>
                <BasicInfo />
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/priority-issues" 
            element={
              <AuthGuard>
                <PriorityIssues />
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/opinion-survey" 
            element={
              <AuthGuard>
                <OpinionSurvey />
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/review" 
            element={
              <AuthGuard>
                <Review />
              </AuthGuard>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
