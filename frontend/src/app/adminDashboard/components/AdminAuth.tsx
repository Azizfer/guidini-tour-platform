"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ADMIN_TOKEN = 'admin123'

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (!token || token !== ADMIN_TOKEN) {
      router.push('/')
    }
  }, [router])

  return <>{children}</>
}
