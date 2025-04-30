'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting to login with:', { email })
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Auth error:', error)
        throw new Error(error.message)
      }

      if (!data.user) {
        console.error('No user data returned from Supabase')
        throw new Error('Authentication failed')
      }

      console.log('Auth successful, user data:', data.user)

      // Get user profile from database
      console.log('Getting user profile from database')
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) {
        console.error('Error getting user profile:', userError)
        throw new Error('Failed to get user profile')
      }

      if (!userData) {
        console.log('User not found, creating new profile')
        try {
          // Create new user profile
          const { data: newUser, error: createError } = await supabase
            .from('User')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || '',
                phone: data.user.user_metadata?.phone || '',
                address: data.user.user_metadata?.address || '',
                role: data.user.user_metadata?.role || 'PATIENT',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ])
            .select()
            .single()

          if (createError) {
            console.error('Error creating user profile:', createError)
            throw new Error('Failed to create user profile')
          }

          console.log('New user created:', newUser)
          router.push('/dashboard')
          return
        } catch (createError) {
          console.error('Error creating user:', createError)
          throw new Error('Failed to create user profile')
        }
      }

      console.log('User found in database:', userData)
      
      // Redirect to dashboard page
      console.log('Redirecting to dashboard page')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error logging in:', error)
      setError(error instanceof Error ? error.message : 'Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-indigo-100">Sign in to access your medical appointments</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-6">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition duration-200 mb-4 font-medium shadow-md"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center">
                <p className="text-purple-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 