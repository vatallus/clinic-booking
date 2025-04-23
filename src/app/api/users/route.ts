import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    console.log('Received request to create user')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { id, email, name, phone, address, role } = body

    // Validate required fields
    if (!id || !email || !name || !phone || !address || !role) {
      console.error('Missing required fields:', { id, email, name, phone, address, role })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Creating user in database...')
    // Create user profile
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        phone,
        address,
        role
      }
    })

    console.log('User created successfully:', user)
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle duplicate user error
    if (error.code === 'P2002') {
      console.error('Duplicate user error:', error)
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Handle other Prisma errors
    if (error.code) {
      console.error('Prisma error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    // Handle any other errors
    return NextResponse.json(
      { error: error.message || 'Failed to create user profile' },
      { status: 500 }
    )
  }
} 