'use client'
import { User } from '@/types/user'
import { useState, useEffect } from 'react'

export const useUser = () => {

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return user
}
