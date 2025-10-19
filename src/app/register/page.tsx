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
  const [specialty, setSpecialty] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Starting registration process...')
      console.log('Form data:', { email, password, name, phone, address, role, specialty, licenseNumber })

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            address,
            role,
            specialty: role === 'DOCTOR' ? specialty : null,
            licenseNumber: role === 'DOCTOR' ? licenseNumber : null
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
      
      // Create user profile in database
      const userData: any = {
        id: data.user.id,
        email: data.user.email,
        name: name,
        phone: phone || null,
        address: address || null,
        role: role
      }

      // Add doctor-specific fields if role is DOCTOR
      if (role === 'DOCTOR') {
        userData.specialty = specialty || null
        userData.licenseNumber = licenseNumber || null
      }

      console.log('User data to be inserted:', userData)

      const { data: insertedUser, error: insertError } = await supabase
        .from('User')
        .insert([userData])
        .select()
        .single()

      console.log('Database response status:', insertError ? 'error' : '200')
      console.log('Database response:', insertedUser)

      if (insertError) {
        console.error('Error creating user profile:', insertError)
        throw new Error(`Failed to create user profile: ${insertError.message}`)
      }

      console.log('Registration successful, redirecting to login...')
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
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
            <h1 className="text-4xl font-bold text-white mb-2">Đăng ký tài khoản</h1>
            <p className="text-indigo-100">Tham gia hệ thống quản lý phòng khám</p>
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
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="role">
                  Vai trò
                </label>
                <select
                  id="role"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="PATIENT">Bệnh nhân</option>
                  <option value="DOCTOR">Bác sĩ</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="name">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nhập họ và tên"
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
                  placeholder="Nhập email"
                />
              </div>

              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="password">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Tạo mật khẩu"
                  minLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="phone">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="mb-4">
                <label className="block text-indigo-700 mb-2 font-medium" htmlFor="address">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              {role === 'DOCTOR' && (
                <>
                  <div className="mb-4">
                    <label className="block text-indigo-700 mb-2 font-medium" htmlFor="specialty">
                      Chuyên khoa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="specialty"
                      className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      required={role === 'DOCTOR'}
                      placeholder="VD: Nội khoa, Ngoại khoa, Nhi khoa..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-indigo-700 mb-2 font-medium" htmlFor="licenseNumber">
                      Số chứng chỉ hành nghề
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Nhập số chứng chỉ hành nghề"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition duration-200 mb-4 font-medium shadow-md"
                disabled={loading}
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </button>

              <div className="text-center">
                <p className="text-purple-600">
                  Đã có tài khoản?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Đăng nhập tại đây
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

