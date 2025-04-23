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
            role: 'PATIENT'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
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

          <div className="mb-4">
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
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-2 border border-gray-300 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full p-2 border border-gray-300 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="address">
              Address
            </label>
            <input
              type="text"
              id="address"
              className="w-full p-2 border border-gray-300 rounded"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 mb-4"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-600">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 