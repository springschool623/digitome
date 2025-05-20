'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Contact } from '@/types/contact'
import { getContacts } from '@/api/contacts'

interface ContactContextType {
  departments: string[]
  locations: string[]
  ranks: string[]
  addContact: (contact: Contact) => void
  addContacts: (contacts: Omit<Contact, 'id'>[]) => void
  initializeData: () => Promise<void>
}

const ContactContext = createContext<ContactContextType | undefined>(undefined)

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [ranks, setRanks] = useState<string[]>([])

  const updateUniqueValues = (contacts: Omit<Contact, 'id'>[]) => {
    const uniqueDepartments = Array.from(new Set(contacts.map(c => c.department).filter(Boolean)))
    const uniqueLocations = Array.from(new Set(contacts.map(c => c.location).filter(Boolean)))
    const uniqueRanks = Array.from(new Set(contacts.map(c => c.rank).filter(Boolean)))

    setDepartments(uniqueDepartments)
    setLocations(uniqueLocations)
    setRanks(uniqueRanks)
  }

  const addContact = (contact: Contact) => {
    if (contact.department && !departments.includes(contact.department)) {
      setDepartments(prev => [...prev, contact.department])
    }
    if (contact.location && !locations.includes(contact.location)) {
      setLocations(prev => [...prev, contact.location])
    }
    if (contact.rank && !ranks.includes(contact.rank)) {
      setRanks(prev => [...prev, contact.rank])
    }
  }

  const addContacts = (contacts: Omit<Contact, 'id'>[]) => {
    updateUniqueValues(contacts)
  }

  const initializeData = async () => {
    try {
      const contacts = await getContacts()
      updateUniqueValues(contacts)
    } catch (error) {
      console.error('Lỗi khi khởi tạo dữ liệu:', error)
    }
  }

  useEffect(() => {
    initializeData()
  }, [])

  return (
    <ContactContext.Provider value={{ departments, locations, ranks, addContact, addContacts, initializeData }}>
      {children}
    </ContactContext.Provider>
  )
}

export function useContact() {
  const context = useContext(ContactContext)
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactProvider')
  }
  return context
} 