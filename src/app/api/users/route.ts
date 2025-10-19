import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')

    let where: any = {}
    if (role) {
      where.role = role
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        specialty: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

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