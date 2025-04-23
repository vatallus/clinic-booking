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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-300 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 mb-4"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-600">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 