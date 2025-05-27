'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getDepartments } from '@/api/departments'
import { getLocations } from '@/api/locations'
import { getRanks } from '@/api/ranks'
import { getPositions } from '@/api/positions'

interface ContactContextType {
  departments: { id: number; name: string }[]
  locations: { id: number; name: string }[]
  ranks: { id: number; name: string }[]
  positions: { id: number; name: string }[]
  loading: boolean
  error: string | null
}

const ContactContext = createContext<ContactContextType>({
  departments: [],
  locations: [],
  ranks: [],
  positions: [],
  loading: false,
  error: null,
})

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([])
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([])
  const [ranks, setRanks] = useState<{ id: number; name: string }[]>([])
  const [positions, setPositions] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [departmentsData, locationsData, ranksData, positionsData] =
          await Promise.all([
            getDepartments(),
            getLocations(),
            getRanks(),
            getPositions(),
          ])

        // console.log('departmentsData:', departmentsData)
        // console.log('locationsData:', locationsData)
        // console.log('ranksData:', ranksData)
        // console.log('positionsData:', positionsData)

        setDepartments(departmentsData)
        setLocations(locationsData)
        setRanks(ranksData)
        setPositions(positionsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <ContactContext.Provider
      value={{
        departments,
        locations,
        ranks,
        positions,
        loading,
        error,
      }}
    >
      {children}
    </ContactContext.Provider>
  )
}

export const useContact = () => {
  const context = useContext(ContactContext)
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider')
  }
  return context
}
