import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function useProfile() {
  const { user } = useAuth()
  const [unlockedAll, setUnlockedAll] = useState(false)
  const [pdfUnlocked, setPdfUnlocked] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    setLoadingProfile(true)
    const { data } = await supabase
      .from('zerohour_profiles')
      .select('unlocked_all, pdf_unlocked')
      .eq('user_id', userId)
      .maybeSingle()
    setUnlockedAll(data?.unlocked_all ?? false)
    setPdfUnlocked(data?.pdf_unlocked ?? false)
    setLoadingProfile(false)
  }, [])

  useEffect(() => {
    if (!user) { setUnlockedAll(false); setPdfUnlocked(false); return }
    fetchProfile(user.id)
  }, [user, fetchProfile])

  const refetchProfile = useCallback(() => {
    if (user) fetchProfile(user.id)
  }, [user, fetchProfile])

  return { unlockedAll, pdfUnlocked, loadingProfile, refetchProfile }
}
