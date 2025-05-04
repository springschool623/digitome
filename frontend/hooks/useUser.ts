'use client'
import { useState, useEffect } from 'react'

export const useUser = () => {
  type User = {
    id: number
    mobile_phone: string
    role: string
  }

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return user
}
