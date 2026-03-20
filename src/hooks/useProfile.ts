import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function useProfile() {
  const { user } = useAuth()
  const [unlockedAll, setUnlockedAll] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    if (!user) { setUnlockedAll(false); return }
    setLoadingProfile(true)
    supabase
      .from('zerohour_profiles')
      .select('unlocked_all')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setUnlockedAll(data?.unlocked_all ?? false)
        setLoadingProfile(false)
      })
  }, [user])

  return { unlockedAll, loadingProfile }
}
