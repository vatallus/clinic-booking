'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (userData?.role === 'DOCTOR') {
        router.push('/doctor/dashboard')
      } else if (userData?.role === 'PATIENT') {
        router.push('/patient/dashboard')
      } else {
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  return null
} 