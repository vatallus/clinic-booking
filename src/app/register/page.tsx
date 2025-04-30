'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [role, setRole] = useState('PATIENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Starting registration process...')
      console.log('Form data:', { email, password, name, phone, address })

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            address,
            role
          }
        }
      })

      console.log('Auth response:', { authData: data, authError: error })

      if (error) {
        console.error('Auth error:', error)
        throw new Error(error.message)
      }

      if (!data.user) {
        console.error('No user data returned from Supabase')
        throw new Error('Registration failed')
      }

      console.log('Creating user profile in database...')
      const now = new Date().toISOString()
      console.log('User data to be inserted:', {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
        phone: data.user.user_metadata?.phone || '',
        address: data.user.user_metadata?.address || '',
        role: data.user.user_metadata?.role || 'PATIENT',
        createdAt: now,
        updatedAt: now
      })

      // Create user profile in database
      const { data: userData, error: insertError } = await supabase
        .from('User')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
            address: data.user.user_metadata?.address || '',
            role: data.user.user_metadata?.role || 'PATIENT',
            createdAt: now,
            updatedAt: now
          }
        ])
        .select()
        .single()

      console.log('Database response status:', insertError ? 'error' : '200')
      console.log('Database response:', userData)

      if (insertError) {
        console.error('Error creating user profile:', insertError)
        throw new Error(`Failed to create user profile: ${insertError.message}`)
      }

      console.log('Registration successful, redirecting to login...')
      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-indigo-100">Join our medical community</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

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

              <div className="mb-4">
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
                  placeholder="Create a password"
                />
              </div>

              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Enter your address"
                />
              </div>

              <div className="mb-6">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition duration-200 mb-4 font-medium shadow-md"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>

              <div className="text-center">
                <p className="text-purple-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Login here
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