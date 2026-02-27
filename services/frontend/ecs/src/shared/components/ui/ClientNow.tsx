"use client"

import React, { useEffect, useState } from 'react'

type Props = {
  date?: string
  format?: 'locale' | 'date'
}

export default function ClientNow({ date, format = 'locale' }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const compute = () => {
      try {
        const d = date ? new Date(date) : new Date()
        setValue(format === 'date' ? d.toLocaleDateString() : d.toLocaleString())
      } catch (e) {
        setValue('')
      }
    }

    compute()
    const id = setInterval(compute, 60000)
    return () => clearInterval(id)
  }, [date, format])

  return <>{value}</>
}
