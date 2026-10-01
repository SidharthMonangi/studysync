import { useEffect, useState, useCallback, useMemo } from 'react'
import { auth, db } from '@/firebase'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { AuthContext } from './AuthStore'
import { withTimeout, friendlyError } from '@/lib/errors'
const defaultProfile = () => ({ name: '', college: '', semesterYear: '', studyGoal: '', onboarded: false })
export function AuthProvider({ children }) {
  const [state, setState] = useState({ session: null, profile: null, isLoading: true, error: '' })
  useEffect(() => {
    let profileSubscription = () => {}
    let generation = 0
    const unsubscribe = onAuthStateChanged(auth, user => {
      const current = ++generation
      profileSubscription()
      if (!user) { setState({ session: null, profile: null, isLoading: false, error: '' }); return }
      const session = { userId: user.uid, email: user.email }
      setState({ session, profile: null, isLoading: true, error: '' })
      const timer = setTimeout(() => {
        if (generation === current) setState({ session, profile: defaultProfile(), isLoading: false, error: 'Profile sync is taking too long. Check your connection and reload.' })
      }, 12000)
      const stop = onSnapshot(doc(db, 'users', user.uid), snap => {
        clearTimeout(timer)
        if (generation === current) setState({ session, profile: snap.exists() ? { ...defaultProfile(), ...snap.data() } : defaultProfile(), isLoading: false, error: '' })
      }, error => {
        clearTimeout(timer)
        if (generation === current) setState({ session, profile: defaultProfile(), isLoading: false, error: friendlyError(error) })
      })
      profileSubscription = () => { clearTimeout(timer); stop() }
    })
    return () => { generation++; unsubscribe(); profileSubscription() }
  }, [])
  const signup = useCallback(async ({ name, email, password }) => {
    const result = await withTimeout(createUserWithEmailAndPassword(auth, email.trim(), password))
    try { await withTimeout(setDoc(doc(db, 'users', result.user.uid), { ...defaultProfile(), name: name.trim() }, { merge: true })) }
    catch (cause) { throw new Error('Your account was created, but profile sync failed. Sign in again to finish setup.', { cause }) }
    return { ok: true }
  }, [])
  const login = useCallback(async ({ email, password }) => { await withTimeout(signInWithEmailAndPassword(auth, email.trim(), password)); return { ok: true } }, [])
  const logout = useCallback(() => signOut(auth), [])
  const userId = state.session?.userId || null
  const saveProfile = useCallback(async partial => {
    if (!userId) throw new Error('Sign in to save your profile.')
    const patch = { ...defaultProfile(), ...state.profile, ...partial }
    await withTimeout(setDoc(doc(db, 'users', userId), patch, { merge: true }))
  }, [userId, state.profile])
  const completeOnboarding = useCallback(data => saveProfile({ ...data, onboarded: true }), [saveProfile])
  const currentUser = useMemo(() => state.session ? { id: userId, email: state.session.email, name: state.profile?.name || '' } : null, [state.session, state.profile, userId])
  return <AuthContext.Provider value={{ ...state, userId, currentUser, displayName: state.profile?.name?.trim() || 'Student', signup, login, logout, updateProfile: saveProfile, completeOnboarding }}>{children}</AuthContext.Provider>
}
