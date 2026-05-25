'use client'
import { useState, useEffect } from 'react'
export function useMob() {
  const [mob, setMob] = useState(false)
  useEffect(() => {
    const check = () => setMob(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return mob
}
