import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { auth, db } from '@/firebase'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const defaultProfile = () => ({
  name: '',
  college: '',
  semesterYear: '',
  studyGoal: '',
  onboarded: false,
})
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const userId = session?.userId ?? null
  const displayName = profile?.name?.trim() || 'Student'
  const currentUser = useMemo(() => {
    if (!session || !profile) return null
    return { id: session.userId, email: session.email, name: profile.name }
  }, [session, profile])

  // Initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setSession({ userId: user.uid, email: user.email })
        try {
          const docRef = doc(db, 'users', user.uid)
          const snap = await getDoc(docRef)
          if (snap.exists()) {
            setProfile(snap.data())
          } else {
            // Fallback if profile doesn't exist for some reason
            setProfile(defaultProfile())
          }
        } catch (err) {
          console.error('Failed to fetch profile', err)
          setProfile(defaultProfile())
        }
      } else {
        setSession(null)
        setProfile(null)
      }
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signup = useCallback(async ({ name, email, password }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUserId = userCredential.user.uid
    
    const initialProfile = {
      ...defaultProfile(),
      name: name.trim(),
      onboarded: false,
    }
    
    await setDoc(doc(db, 'users', newUserId), initialProfile)
    setProfile(initialProfile)
    return { ok: true }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    await signInWithEmailAndPassword(auth, email, password)
    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const completeOnboarding = useCallback(async (data) => {
    if (!userId) return
    const docRef = doc(db, 'users', userId)
    await updateDoc(docRef, { ...data, onboarded: true })
    setProfile((prev) => ({ ...prev, ...data, onboarded: true }))
  }, [userId])

  const updateProfile = useCallback(async (partial) => {
    if (!userId) return
    const docRef = doc(db, 'users', userId)
    await updateDoc(docRef, partial)
    setProfile((prev) => ({ ...prev, ...partial }))
  }, [userId])

  const resetAllLocalData = useCallback(async () => {
    // We do not delete Firestore data here for safety in production.
    // Instead we just log out.
    await signOut(auth)
  }, [])

  const value = {
    session,
    userId,
    currentUser,
    profile,
    displayName,
    isLoading,
    signup,
    login,
    logout,
    completeOnboarding,
    updateProfile,
    resetAllLocalData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
