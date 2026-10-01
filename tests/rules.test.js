import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { beforeAll, afterAll, beforeEach, it } from 'vitest'
let env
beforeAll(async()=>{env=await initializeTestEnvironment({projectId:'demo-studysync',firestore:{rules:readFileSync('firestore.rules','utf8')}})})
afterAll(async()=>env?.cleanup())
beforeEach(async()=>env.clearFirestore())
const profile={name:'Student',college:'College',semesterYear:'1',studyGoal:'Learn',onboarded:true}
const task={id:'task',title:'Read a chapter',description:'',subject:'Math',dueDate:'2026-10-02',dueTime:'09:00',priority:'medium',status:'todo',progress:0,createdAt:'2026-10-02T09:00:00Z'}
it('permits the owner profile and prevents unauthenticated and cross-user reads',async()=>{const db=env.authenticatedContext('alice').firestore();await assertSucceeds(setDoc(doc(db,'users/alice'),profile));await assertSucceeds(getDoc(doc(db,'users/alice')));await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'users/alice')));await assertFails(getDoc(doc(env.authenticatedContext('bob').firestore(),'users/alice')))})
it('permits owner task CRUD and collection queries',async()=>{const db=env.authenticatedContext('alice').firestore();const ref=doc(db,'users/alice/tasks/task');await assertSucceeds(setDoc(ref,task));await assertSucceeds(getDocs(collection(db,'users/alice/tasks')));await assertSucceeds(updateDoc(ref,{status:'completed',progress:100}));await assertSucceeds(deleteDoc(ref))})
it('rejects ownership spoofing, invalid updates and unknown privileged fields',async()=>{const db=env.authenticatedContext('alice').firestore();await assertFails(setDoc(doc(db,'users/bob/tasks/task'),task));await assertFails(setDoc(doc(db,'users/alice'),{...profile,role:'admin'}));const ref=doc(db,'users/alice/tasks/task');await assertSucceeds(setDoc(ref,task));await assertFails(updateDoc(ref,{id:'spoofed'}));await assertFails(updateDoc(ref,{progress:101}));await assertFails(updateDoc(ref,{title:42}))})
it('permits valid notes, plans, sessions and settings',async()=>{const db=env.authenticatedContext('alice').firestore();await assertSucceeds(setDoc(doc(db,'users/alice/notes/n'),{id:'n',title:'Biology',subject:'Science',content:'Plants use light energy.',summary:null,quizQuestions:null,flashcards:null,createdAt:'now',updatedAt:'now'}));await assertSucceeds(setDoc(doc(db,'users/alice/planner/p'),{id:'p',subject:'Math',topic:'Practice',date:'2026-10-02',startTime:'09:00',durationMinutes:25,status:'planned',createdAt:'now'}));await assertSucceeds(setDoc(doc(db,'users/alice/sessions/s'),{id:'s',focusMinutes:25,completedAt:'now'}));await assertSucceeds(setDoc(doc(db,'users/alice/pomodoroSettings/default'),{focus:25,shortBreak:5,longBreak:15,sessionsBeforeLongBreak:4}))})
it('enforces a timestamped quota that cannot be reset or advanced into future days',async()=>{const db=env.authenticatedContext('alice').firestore();const day=new Date().toISOString().slice(0,10).replaceAll('-','');const ref=doc(db,`users/alice/aiUsage/${day}`);await assertSucceeds(setDoc(ref,{count:1,lastRequest:serverTimestamp()}));await assertFails(setDoc(ref,{count:1,lastRequest:serverTimestamp()}));await assertFails(updateDoc(ref,{count:2,lastRequest:serverTimestamp()}));await assertFails(deleteDoc(ref));await assertFails(setDoc(doc(db,'users/alice/aiUsage/20990101'),{count:1,lastRequest:serverTimestamp()}))})

it('rejects malformed study materials on both create and update', async () => {
 const db=env.authenticatedContext('alice').firestore()
 const ref=doc(db,'users/alice/notes/n')
 const note={id:'n',title:'Biology',subject:'Science',content:'Plants use light energy.',summary:null,quizQuestions:null,flashcards:null,createdAt:'now',updatedAt:'now'}
 await assertFails(setDoc(ref,{...note,quizQuestions:[{question:'Q',options:['A'],correctAnswer:'made up'}]}))
 await assertSucceeds(setDoc(ref,note))
 await assertFails(updateDoc(ref,{flashcards:[{front:42,back:'Invalid'}]}))
 await assertSucceeds(updateDoc(ref,{quizQuestions:[{question:'Q',options:['A','B','C','D'],correctAnswer:'A'}],flashcards:[{front:'Question',back:'Answer'}]}))
})
