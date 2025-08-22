import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Hello, CivicLens
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to your Vite + React app!
        </p>
        <Link
          to="/signin"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}

export default Home
