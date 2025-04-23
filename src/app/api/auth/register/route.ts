import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('Register request received')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { email, password, name, phone, address } = body

    if (!email || !password || !name) {
      console.error('Missing required fields')
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Sign up with Supabase Auth
    console.log('Attempting to sign up with Supabase')
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

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      console.error('No user data returned from Supabase')
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }

    console.log('Auth successful, user data:', data.user)

    // Create user profile in database using Supabase client
    console.log('Creating user profile in database')
    try {
      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
            address: data.user.user_metadata?.address || '',
            role: data.user.user_metadata?.role || 'PATIENT'
          }
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user profile:', insertError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      console.log('User profile created:', userData)
      return NextResponse.json({ 
        user: userData,
        message: 'Registration successful'
      })
    } catch (createError) {
      console.error('Error creating user profile:', createError)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register' },
      { status: 500 }
    )
  }
} 